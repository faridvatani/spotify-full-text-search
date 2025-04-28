/**
 * Represents an artist in Spotify data.
 */
export interface Artist {
  id: string;
  name: string;
}

/**
 * Represents a single Spotify data record.
 */
export interface SpotifyData {
  id: number;
  title: string;
  album: string;
  genre: string;
  release_date: string;
  artists: Artist[];
}

/**
 * Represents a genre aggregation result.
 */
export type GenreAggregations = {
  genre: string;
  count: number;
};

/**
 * Represents the result of a search query.
 */
export type SearchResult = {
  items: SpotifyData[];
  total: number;
  genreAggregations: GenreAggregations[];
};
