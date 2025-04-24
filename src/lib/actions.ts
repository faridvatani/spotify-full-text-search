"use server";
import client, { SPOTIFY_INDEX, SPOTIFY_MAPPING } from "@/lib/elasticsearch";

export type SpotifyData = {
  id: number;
  title: string;
  album: string;
  genre: string;
  release_date: string;
  artists: { id: string; name: string }[];
};

async function waitForIndexReady(maxRetries = 10, delay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const health = await client.cluster.health({
        index: SPOTIFY_INDEX,
        timeout: "30s",
        wait_for_status: "yellow",
      });

      if (health.status === "green" || health.status === "yellow") {
        console.log(`Index is ready with status: ${health.status}`);
        return true;
      }
    } catch (error: unknown) {
      console.log(
        `Waiting for index to be ready... (attempt ${i + 1}/${maxRetries})`,
      );
      console.error("Error checking index health:", error);
    }

    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  throw new Error("Index failed to become ready");
}

export async function initializeIndex() {
  const exists = await client.indices.exists({ index: SPOTIFY_INDEX });
  if (!exists) {
    await client.indices.create({
      index: SPOTIFY_INDEX,
      ...SPOTIFY_MAPPING,
    });
  }

  await waitForIndexReady();
}

export async function indexSpotifyData(data: SpotifyData[]) {
  if (data.length === 0) {
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

    const hasErrors = items.some((item) => item.index?.error);
    if (hasErrors) {
      console.error(
        "Some items failed to index:",
        items
          .filter((item) => item.index?.error)
          .map((item) => item.index?.error),
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Bulk indexing error:", error);
    return false;
  }
}
