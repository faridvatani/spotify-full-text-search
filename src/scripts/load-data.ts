import { indexSpotifyData, initializeIndex } from "@/lib/actions";
import { SpotifyData } from "@/lib/types";
import { delay } from "@/lib/utils";
import { readFile } from "fs/promises";
import { join } from "path";


/**
 * Reads and parses JSON data from a file.
 * @param filePath - Path to the JSON file.
 * @returns Parsed JSON data as an array of SpotifyData.
 */
async function readJsonFile<T>(filePath: string): Promise<T> {
  try {
    const jsonData = await readFile(filePath, "utf-8");
    return JSON.parse(jsonData);
  } catch (error) {
    console.error(`Failed to read or parse JSON file at ${filePath}:`, error);
    throw error;
  }
}

/**
 * Splits an array into smaller chunks of a specified size.
 * @param array - The array to split.
 * @param chunkSize - The size of each chunk.
 * @returns An array of chunks.
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Processes and indexes data into Elasticsearch in chunks.
 * @param data - Array of SpotifyData to index.
 * @param chunkSize - Number of items per chunk.
 * @param delayBetweenChunks - Delay between processing chunks (in ms).
 */
async function processChunks(
  data: SpotifyData[],
  chunkSize: number,
  delayBetweenChunks: number,
): Promise<void> {
  const chunks = chunkArray(data, chunkSize);
  console.log(`Indexing ${data.length} items in ${chunks.length} chunks...`);

  let successCount = 0;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(
      `\x1b[34mProcessing chunk ${i + 1}/${chunks.length} (${chunk.length} items)...\x1b[0m`,
    );

    try {
      const success = await indexSpotifyData(chunk);
      if (success) {
        successCount++;
        console.log(`Chunk ${i + 1} indexed successfully.`);
      } else {
        console.warn(`Chunk ${i + 1} failed to index.`);
      }

      if (i < chunks.length - 1) {
        console.log(
          `Waiting ${delayBetweenChunks}ms before processing the next chunk...`,
        );
        await delay(delayBetweenChunks);
      }
    } catch (error) {
      console.error(`Error processing chunk ${i + 1}:`, error);
      console.log(`Retrying after delay...`);
      await delay(delayBetweenChunks * 2);
    }
  }

  console.log(
    `\x1b[32mCompleted indexing. ${successCount} chunks succeeded out of ${chunks.length}.\x1b[0m`,
  );
}

/**
 * Main function to load and index data into Elasticsearch.
 */
async function loadData(): Promise<void> {
  try {
    const dataPath = join(process.cwd(), "src", "data", "spotify-data.json");
    console.log(`Reading data from ${dataPath}...`);
    const sampleData = await readJsonFile<SpotifyData[]>(dataPath);

    console.log("Initializing Elasticsearch index...");
    await initializeIndex();

    const CHUNK_SIZE = 25;
    const DELAY_BETWEEN_CHUNKS = 1000;

    await processChunks(sampleData, CHUNK_SIZE, DELAY_BETWEEN_CHUNKS);
  } catch (error) {
    console.error("Error during data loading:", error);
    process.exit(1);
  }
}

loadData();
