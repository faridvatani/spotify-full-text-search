import { Artist, SpotifyData } from "@/lib/types";
import FaceIcon from "@mui/icons-material/Face";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Typography, useTheme, Paper, Chip } from "@mui/material";

interface DataTableProps {
  rows: SpotifyData[];
  totalRows: number;
  loading: boolean;
  page: number;
  pageSize: number;
  onPaginationChange: (page: number, pageSize: number) => void;
}

export function DataTable({
  rows,
  totalRows,
  loading,
  page,
  pageSize,
  onPaginationChange,
}: DataTableProps) {
  const theme = useTheme();

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 50,
      renderCell: (params) => (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontFamily: "var(--font-geist-mono)" }}
          >
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "title",
      headerName: "Song",
      width: 280,
      renderCell: (params) => (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "artist",
      headerName: "Artist",
      width: 300,
      renderCell: (params) => (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          {params.row.artists.map((artist: Artist) => (
            <Chip
              key={artist.id}
              label={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <FaceIcon
                    sx={{
                      fontSize: 16,
                      color: theme.palette.text.secondary,
                      marginRight: 1,
                    }}
                  />
                  {artist.name}
                </Box>
              }
              size="small"
              variant="outlined"
              sx={{
                fontWeight: 500,
                marginRight: 1,
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.palette.divider,
              }}
            />
          ))}
        </Box>
      ),
    },
    {
      field: "album",
      headerName: "Album",
      width: 300,
      renderCell: (params) => (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "genre",
      headerName: "Genre",
      width: 150,
      renderCell: (params) => (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: "release_date",
      headerName: "Release Date",
      width: 150,
      renderCell: (params) => (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontFamily: "var(--font-geist-mono)" }}
          >
            {params.value}
          </Typography>
        </Box>
      ),
    },
  ];
  return (
    <Paper
      elevation={0}
      sx={{
        height: 500,
        borderRadius: 2,
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        rowCount={totalRows}
        loading={loading}
        pageSizeOptions={[5, 10, 25, 50]}
        paginationMode="server"
        paginationModel={{
          page,
          pageSize,
        }}
        onPaginationModelChange={(model) => {
          onPaginationChange(model.page, model.pageSize);
        }}
        sx={{
          border: "none",
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: theme.palette.background.default,
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
          "& .MuiDataGrid-cell": {
            borderColor: theme.palette.divider,
          },
          "& .MuiDataGrid-row:hover": {
            bgcolor: `${theme.palette.primary.main}08`,
          },
          "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-cell:focus": {
            outline: "none",
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: `1px solid ${theme.palette.divider}`,
          },
        }}
      />
    </Paper>
  );
}
