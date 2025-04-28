"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  useTheme,
  alpha,
} from "@mui/material";
import { GenreAggregations, SpotifyData } from "@/lib/types";
import { useDebounce } from "@/hooks/useDebounce";
import { searchSpotifyData } from "@/lib/actions";
import { SearchBar } from "@/components/SearchBar";
import { DataTable } from "@/components/DataTable";
import { green, grey } from "@mui/material/colors";
import { FilterBar } from "@/components/FilterBar";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [rows, setRows] = useState<SpotifyData[]>([]);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [genreAggregations, setGenreAggregations] = useState<
    GenreAggregations[]
  >([]);
  const theme = useTheme();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await searchSpotifyData(
        debouncedSearchTerm,
        page,
        pageSize,
        selectedGenre,
      );
      console.log(result);
      setRows(result.items);
      setTotalRows(result.total);
      setGenreAggregations(result.genreAggregations);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, page, pageSize, selectedGenre]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePaginationChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleGenreChange = (year: string) => {
    setSelectedGenre(year);
    setPage(0);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: grey[100],
        py: { xs: 6, sm: 10 },
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: { xs: 3, sm: 5 } }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
              textAlign: "center",
              background: `linear-gradient(135deg, ${green[300]}, ${green.A700})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              mb: 1,
            }}
          >
            Spotify Music Explorer
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            sx={{
              color: theme.palette.text.secondary,
              maxWidth: "900px",
              mx: "auto",
              px: 2,
            }}
          >
            Explore your Spotify data with ease. Search, filter, and analyze
            your favorite tracks, artists, and albums. Discover new music and
            insights into your listening habits.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 4 },
            borderRadius: 3,
            border: `3px solid ${green[500]}`,
            bgcolor: alpha(green[50], 0.3),
            backdropFilter: "blur(8px)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              mb: 4,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <SearchBar value={searchTerm} onChange={setSearchTerm} />
            </Box>
            <FilterBar
              genreAggregations={genreAggregations}
              selectedGenre={selectedGenre}
              onGenreChange={handleGenreChange}
            />
          </Box>

          <DataTable
            rows={rows}
            totalRows={totalRows}
            loading={loading}
            page={page}
            pageSize={pageSize}
            onPaginationChange={handlePaginationChange}
          />
        </Paper>
      </Container>
    </Box>
  );
}
