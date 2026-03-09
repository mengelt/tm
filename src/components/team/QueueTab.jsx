import { Paper, Box, CircularProgress, Typography } from '@mui/material';
import { DataGridPremium } from '@mui/x-data-grid-premium';

export default function QueueTab({ rows, columns, loading }) {
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
    <Paper sx={{ height: 520 }}>
      <DataGridPremium
        rows={rows}
        columns={columns}
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
  );
}
