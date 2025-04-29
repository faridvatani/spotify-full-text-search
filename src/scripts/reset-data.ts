import { initializeIndex, indexSpotifyData } from "@/lib/actions";
import client, { SPOTIFY_INDEX } from "@/lib/elasticsearch";
import { SpotifyData } from "@/lib/types";
import { readFile } from "fs/promises";
import { join } from "path";

/**
 * Deletes the existing Elasticsearch index.
 */
async function deleteIndex(): Promise<void> {
  try {
    const indexExists = await client.indices.exists({ index: SPOTIFY_INDEX });

    if (indexExists) {
      console.log(`Deleting index: ${SPOTIFY_INDEX}`);
      await client.indices.delete({ index: SPOTIFY_INDEX });
      console.log(`Index "${SPOTIFY_INDEX}" deleted successfully.`);
    } else {
      console.log(`Index "${SPOTIFY_INDEX}" does not exist.`);
    }
  } catch (error) {
    console.error(`Error deleting index "${SPOTIFY_INDEX}":`, error);
    throw error;
  }
}

/**
 * Reads and parses JSON data from a file.
 * @param filePath - Path to the JSON file.
 * @returns Parsed JSON data.
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
 * Resets all data in Elasticsearch by deleting the index and re-indexing the data.
 */
async function resetData(): Promise<void> {
  try {
    console.log("Starting data reset...");

    // Step 1: Delete the existing index
    await deleteIndex();

    // Step 2: Recreate the index with mappings and settings
    console.log("Reinitializing Elasticsearch index...");
    await initializeIndex();

    // Step 3: Load data from the JSON file
    const dataPath = join(process.cwd(), "src", "data", "spotify-data.json");
    console.log(`Reading data from ${dataPath}...`);
    const data = await readJsonFile<SpotifyData[]>(dataPath);

    // Step 4: Index the data
    console.log("Indexing data...");
    const success = await indexSpotifyData(data);

    if (success) {
      console.log("Data reset completed successfully.");
    } else {
      console.error("Data reset completed with some errors.");
    }
  } catch (error) {
    console.error("Error during data reset:", error);
    process.exit(1);
  }
}

// Run the reset script
resetData();
