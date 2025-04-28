import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  useTheme,
  Typography,
} from "@mui/material";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { GenreAggregations } from "@/lib/types";
import { green } from "@mui/material/colors";

interface FilterBarProps {
  genreAggregations: GenreAggregations[];
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
}

export function FilterBar({
  genreAggregations,
  selectedGenre,
  onGenreChange,
}: FilterBarProps) {
  const theme = useTheme();

  return (
    <FormControl
      sx={{
        minWidth: { xs: "100%", sm: 220 },
        backgroundColor: theme.palette.background.paper,
        borderRadius: 2,
      }}
    >
      <InputLabel id="genre-filter-label" sx={{ bgcolor: "transparent" }}>
        Filter by Genre
      </InputLabel>
      <Select
        labelId="genre-filter-label"
        id="genre-filter"
        value={selectedGenre}
        label="Filter by Genre"
        onChange={(e) => onGenreChange(e.target.value)}
        startAdornment={
          <FilterAltIcon
            sx={{
              ml: 1,
              mr: 1,
              color: theme.palette.text.secondary,
              fontSize: "1.2rem",
            }}
          />
        }
        sx={{
          borderRadius: 2,
          "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
          },
          "&:hover": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: green[500],
            },
          },
          "&.Mui-focused": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: green[500],
              boxShadow: `0 0 0 2px ${green[500]}33`, // 20% opacity for focus shadow
            },
          },
        }}
      >
        <MenuItem value="">
          <em>All Genres</em>
        </MenuItem>
        {genreAggregations.map((agg) => (
          <MenuItem
            key={agg.key}
            value={agg.key}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {agg.key}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                bgcolor: theme.palette.action.hover,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                minWidth: 32,
                textAlign: "center",
              }}
            >
              {agg.doc_count}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
