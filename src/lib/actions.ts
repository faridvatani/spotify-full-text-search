"use server";

import client, { SPOTIFY_INDEX, SPOTIFY_MAPPING } from "@/lib/elasticsearch";
import { GenreAggregations, SearchResult, SpotifyData } from "./types";
import { estypes } from "@elastic/elasticsearch";
import { delay } from "./utils";

/**
 * Waits for the Elasticsearch index to become ready.
 * @param maxRetries - Maximum number of retries.
 * @param retryDelay - Delay between retries in milliseconds.
 * @throws Error if the index fails to become ready.
 */
async function waitForIndexReady(
  maxRetries = 10,
  retryDelay = 2000,
): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const health = await client.cluster.health({
        index: SPOTIFY_INDEX,
        timeout: "30s",
        wait_for_status: "yellow",
      });

      if (health.status === "green" || health.status === "yellow") {
        const statusColor = health.status === "green" ? "\x1b[32m" : "\x1b[33m";
        console.log(
          `${statusColor}Index is ready with status: ${health.status}\x1b[0m`,
        );
        return;
      }
    } catch (error) {
      console.warn(
        `Attempt ${attempt}/${maxRetries}: Waiting for index to be ready...`,
      );
      console.error("Error checking index health:", error);
    }

    await delay(retryDelay);
  }

  throw new Error("Index failed to become ready after maximum retries.");
}

/**
 * Initializes the Elasticsearch index if it doesn't already exist.
 * @throws Error if the index cannot be created or initialized.
 */
export async function initializeIndex(): Promise<void> {
  try {
    const indexExists = await client.indices.exists({ index: SPOTIFY_INDEX });

    if (!indexExists) {
      console.log(`Creating index: ${SPOTIFY_INDEX}`);
      await client.indices.create({
        index: SPOTIFY_INDEX,
        ...SPOTIFY_MAPPING,
      });
    }

    await waitForIndexReady();
  } catch (error) {
    console.error("Error initializing index:", error);
    throw error;
  }
}

/**
 * Indexes an array of Spotify data into Elasticsearch.
 * @param data - Array of SpotifyData objects to index.
 * @returns True if all data is indexed successfully, false otherwise.
 */
export async function indexSpotifyData(data: SpotifyData[]): Promise<boolean> {
  if (data.length === 0) {
    console.warn("No data provided for indexing.");
    return true;
  }

  try {
    const operations = data.flatMap((doc) => [
      { index: { _index: SPOTIFY_INDEX } },
      doc,
    ]);

    const { items } = await client.bulk({
      operations,
      refresh: true,
      timeout: "30s",
    });

    const errors = items.filter((item) => item.index?.error);
    if (errors.length > 0) {
      console.error(
        "Some items failed to index:",
        errors.map((e) => e.index?.error),
      );
      return false;
    }

    console.log(`Successfully indexed ${data.length} documents.`);
    return true;
  } catch (error) {
    console.error("Bulk indexing error:", error);
    return false;
  }
}

/**
 * Builds the "should" clause for the Elasticsearch query.
 * @param query - The search query string.
 * @returns An array of QueryDslQueryContainer for the "should" clause.
 */
function buildShouldClause(query: string): estypes.QueryDslQueryContainer[] {
  return [
    {
      match: {
        title: {
          query,
          boost: 5,
          fuzziness: "AUTO",
        },
      },
    },
    {
      match_phrase: {
        title: {
          query,
          boost: 15,
        },
      },
    },
    {
      multi_match: {
        query,
        fields: ["title^4", "album^2", "artists.name^3"],
        type: "best_fields",
        fuzziness: "AUTO",
        minimum_should_match: "70%",
      },
    },
    {
      nested: {
        path: "artists",
        query: {
          match: {
            "artists.name": {
              query,
              boost: 6,
              fuzziness: "AUTO",
            },
          },
        },
      },
    },
    {
      nested: {
        path: "artists",
        query: {
          match_phrase: {
            "artists.name": {
              query,
              boost: 12,
            },
          },
        },
      },
    },
  ];
}

/**
 * Builds the "must" clause for the Elasticsearch query.
 * @param genreFilter - Optional genre filter for the search.
 * @returns An array of QueryDslQueryContainer for the "must" clause.
 */
function buildMustClause(
  genreFilter?: string,
): estypes.QueryDslQueryContainer[] {
  return genreFilter
    ? [
        {
          term: {
            genre: genreFilter,
          },
        },
      ]
    : [];
}

/**
 * Constructs the Elasticsearch query object.
 * @param query - The search query string.
 * @param genreFilter - Optional genre filter for the search.
 * @returns A QueryDslQueryContainer object.
 */
function buildSearchQuery(
  query: string,
  genreFilter?: string,
): estypes.QueryDslQueryContainer {
  const must = buildMustClause(genreFilter);
  const should = query ? buildShouldClause(query) : [];

  return query || genreFilter
    ? {
        bool: {
          must,
          should: should.length > 0 ? should : undefined,
          minimum_should_match: should.length > 0 ? 1 : undefined,
        },
      }
    : {
        match_all: {},
      };
}

/**
 * Searches for Spotify data in Elasticsearch.
 *
 * @param query - The search query string.
 * @param page - The page number for pagination.
 * @param pageSize - The number of results per page.
 * @param genreFilter - Optional genre filter for the search.
 * @returns A promise that resolves to a SearchResult object containing the search results.
 */
export async function searchSpotifyData(
  query: string = "",
  page: number = 0,
  pageSize: number = 10,
  genreFilter?: string,
): Promise<SearchResult> {
  try {
    const searchQuery = buildSearchQuery(query, genreFilter);
    const response = await client.search({
      index: SPOTIFY_INDEX,
      query: searchQuery,
      from: page * pageSize,
      size: pageSize,
      sort: query ? [{ _score: { order: "desc" } }] : undefined,
      track_total_hits: true,
      aggs: {
        genres: {
          terms: {
            field: "genre",
            size: 16,
            order: {
              _count: "desc",
            },
          },
        },
      },
    });

    const { hits, aggregations } = response;
    const genreBuckets = aggregations?.genres as unknown as {
      buckets: GenreAggregations[];
    };

    return {
      items: hits.hits.map((hit) => hit._source as SpotifyData),
      total:
        typeof hits.total === "number" ? hits.total : hits.total?.value || 0,
      genreAggregations: genreBuckets?.buckets || [],
    };
  } catch (error) {
    console.error("Error executing search query:", error);
    throw new Error("Failed to fetch search results.");
  }
}
