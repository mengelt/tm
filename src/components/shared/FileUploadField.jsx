import { Box, Typography, Button, Paper, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function FileUploadField({ label, file, onFileSelect, onFileRemove }) {
  const handleChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      onFileSelect(selected);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderStyle: file ? 'solid' : 'dashed',
        borderColor: file ? 'success.main' : 'divider',
        bgcolor: file ? 'success.50' : 'background.paper',
      }}
    >
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
        {label}
        {file && (
          <CheckCircleIcon
            color="success"
            sx={{ fontSize: 16, ml: 1, verticalAlign: 'text-bottom' }}
          />
        )}
      </Typography>

      {file ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InsertDriveFileIcon color="action" fontSize="small" />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2">{file.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {formatSize(file.size)}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onFileRemove} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Button
          component="label"
          variant="outlined"
          size="small"
          startIcon={<CloudUploadIcon />}
          sx={{ mt: 0.5 }}
        >
          Upload File
          <input type="file" hidden onChange={handleChange} />
        </Button>
      )}
    </Paper>
  );
}
