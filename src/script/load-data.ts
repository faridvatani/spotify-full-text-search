import { indexSpotifyData, initializeIndex, SpotifyData } from "@/lib/actions";
import { readFile } from "fs/promises";
import { join } from "path";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function loadData() {
  try {
    const dataPath = join(process.cwd(), "src", "seed", "data.json");
    const jsonData = await readFile(dataPath, "utf-8");
    const sampleData: SpotifyData[] = JSON.parse(jsonData);

    console.log("Initializing Elasticsearch index...");
    await initializeIndex();

    const chunkSize = 25;
    const chunks = [];
    for (let i = 0; i < sampleData.length; i += chunkSize) {
      chunks.push(sampleData.slice(i, i + chunkSize));
    }

    console.log(
      `Indexing ${sampleData.length} items in ${chunks.length} chunks...`,
    );

    let successCount = 0;
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(
        `Processing chunk ${i + 1}/${chunks.length} (${chunk.length} items)...`,
      );

      try {
        const success = await indexSpotifyData(chunk);
        if (success) {
          successCount++;
          console.log(`Chunk ${i + 1} indexed successfully`);
        } else {
          console.log(`Chunk ${i + 1} failed to index`);
        }

        if (i < chunks.length - 1) {
          console.log("Waiting before processing next chunk...");
          await delay(1000);
        }
      } catch (error) {
        console.error(`Error processing chunk ${i + 1}:`, error);
        await delay(2000);
      }
    }

    console.log(
      `Completed indexing. ${successCount} chunks succeeded out of ${chunks.length}.`,
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    process.exit(1);
  }
}
loadData();
