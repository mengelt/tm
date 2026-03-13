import { useState, useMemo } from 'react';
import {
  Paper,
  Box,
  CircularProgress,
  Typography,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { DataGrid } from '@mui/x-data-grid';

export default function QueueTab({ rows, columns, loading }) {
  const [search, setSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const lower = search.toLowerCase();
    return rows.filter((row) =>
      Object.values(row).some((val) => {
        if (val == null) return false;
        if (typeof val === 'object' && val.name) return val.name.toLowerCase().includes(lower);
        return String(val).toLowerCase().includes(lower);
      })
    );
  }, [rows, search]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (rows.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <Typography color="text.secondary">No reviews in this category.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TextField
        size="small"
        placeholder="Search reviews..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 1.5, width: 320 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
      />
      <Paper sx={{ height: 520 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          initialState={{
            sorting: {
              sortModel: [{ field: 'needByDate', sort: 'asc' }],
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          pagination
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: 'grey.50',
            },
          }}
        />
      </Paper>
    </Box>
  );
}
