import { Client, estypes } from "@elastic/elasticsearch";

const client = new Client({
  node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
  requestTimeout: 60000,
  maxRetries: 5,
});

export const SPOTIFY_INDEX = "spotify";

const settings: estypes.IndicesIndexSettings = {
  index: {
    number_of_shards: 1,
    number_of_replicas: 0,
    refresh_interval: "5s",
  },
  analysis: {
    analyzer: {
      ngram_analyzer: {
        type: "custom",
        tokenizer: "ngram_tokenizer",
        filter: ["lowercase"],
      },
    },
    tokenizer: {
      ngram_tokenizer: {
        type: "ngram",
        min_gram: 3,
        max_gram: 4,
        token_chars: ["letter", "digit"],
      },
    },
  },
};

const mappings: estypes.MappingTypeMapping = {
  properties: {
    title: {
      type: "text",
      analyzer: "standard",
      fields: {
        keyword: {
          type: "keyword",
        },
      },
    },
    explanation: {
      type: "text",
      analyzer: "standard",
    },
    date: {
      type: "date",
      format: "yyyy-MM-dd",
    },
    album: {
      type: "text",
      analyzer: "standard",
      fields: {
        keyword: {
          type: "keyword",
        },
      },
    },
    genre: {
      type: "text",
      analyzer: "standard",
      fields: {
        keyword: {
          type: "keyword",
        },
      },
    },
    artists: {
      type: "nested",
      properties: {
        id: {
          type: "keyword",
        },
        name: {
          type: "text",
          analyzer: "standard",
          fields: {
            keyword: {
              type: "keyword",
            },
          },
        },
      },
    },
  },
  runtime: {
    "date.year": {
      type: "keyword",
      script: {
        source: "emit(doc['date'].value.year.toString())",
      },
    },
  },
};

export const SPOTIFY_MAPPING = {
  settings,
  mappings,
} as const;

export default client;
