import { TextField, InputAdornment, useTheme } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { green } from "@mui/material/colors";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const theme = useTheme();

  return (
    <TextField
      fullWidth
      placeholder="Search for songs, artists, or albums"
      variant="outlined"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: theme.palette.text.secondary }} />
          </InputAdornment>
        ),
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          transition: theme.transitions.create(["border-color", "box-shadow"]),
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: green[500],
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: green[500],
            boxShadow: `0 0 0 2px ${green[500]}33`, // 20% opacity for focus shadow
          },
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.divider, // Default border color
        },
      }}
    />
  );
}
