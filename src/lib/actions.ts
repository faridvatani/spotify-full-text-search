"use server";

import client, { SPOTIFY_INDEX, SPOTIFY_MAPPING } from "@/lib/elasticsearch";
import { SpotifyData } from "./types";

/**
 * Utility function to introduce a delay.
 */
const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

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
        console.log(`${statusColor}Index is ready with status: ${health.status}\x1b[0m`);
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
