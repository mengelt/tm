import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InboxIcon from '@mui/icons-material/Inbox';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import StatusChip from '../shared/StatusChip';
import ConfirmDialog from '../shared/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { ReviewStatus } from '../../types';
import { fetchReviewsBySubmitter, cancelReview } from '../../mock/api';

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await fetchReviewsBySubmitter(user.id);
    setReviews(data);
    setLoading(false);
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCancel = async () => {
    if (cancelTarget) {
      await cancelReview(cancelTarget.id);
      setCancelTarget(null);
      loadData();
    }
  };

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 140,
      renderCell: (params) => {
        if (params.row.status === ReviewStatus.TM_REVIEW_COMPLETE) {
          return params.value;
        }
        return <span style={{ color: '#9e9e9e', fontStyle: 'italic' }}>N/A</span>;
      },
    },
    {
      field: 'subject',
      headerName: 'Subject',
      flex: 1,
      minWidth: 250,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 200,
      renderCell: (params) => (
        <StatusChip
          status={params.value}
          label={
            params.value === ReviewStatus.CUSTOMER_WORK_NEEDED
              ? 'Returned for Rework'
              : undefined
          }
        />
      ),
    },
    {
      field: 'urgent',
      headerName: 'Urgent',
      width: 90,
      type: 'boolean',
    },
    {
      field: 'needByDate',
      headerName: 'Need By',
      width: 120,
      valueFormatter: (value) => (value ? dayjs(value).format('MMM D, YYYY') : '—'),
    },
    {
      field: 'submittedDate',
      headerName: 'Submitted',
      width: 120,
      valueFormatter: (value) => (value ? dayjs(value).format('MMM D, YYYY') : '—'),
    },
    {
      field: 'scheduledDate',
      headerName: 'Scheduled',
      width: 130,
      valueFormatter: (value) => (value ? dayjs(value).format('MMM D, YYYY') : '—'),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => {
        const actions = [];
        const { status } = params.row;

        if (status === ReviewStatus.CUSTOMER_WORK_NEEDED) {
          actions.push(
            <GridActionsCellItem
              key="edit"
              icon={<EditIcon />}
              label="Edit & Re-Submit"
              onClick={() => navigate(`/customer/edit/${params.id}`)}
              showInMenu={false}
            />,
            <GridActionsCellItem
              key="cancel-cw"
              icon={<CancelIcon />}
              label="Cancel"
              onClick={() => setCancelTarget(params.row)}
            />
          );
        }

        if (status === ReviewStatus.INTAKE_REVIEW) {
          actions.push(
            <GridActionsCellItem
              key="cancel-ir"
              icon={<CancelIcon />}
              label="Cancel"
              onClick={() => setCancelTarget(params.row)}
            />
          );
        }

        if (status === ReviewStatus.TM_REVIEW_COMPLETE) {
          actions.push(
            <GridActionsCellItem
              key="view"
              icon={<VisibilityIcon />}
              label="View Review"
              onClick={() => navigate(`/team/review/${params.id}/view`)}
            />
          );
        }

        return actions;
      },
    },
  ];

  const renderEmptyState = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 2,
        py: 8,
      }}
    >
      <InboxIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
      <Typography color="text.secondary">
        You have not submitted any requests yet.
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => navigate('/customer/new')}
      >
        Create Your First Request
      </Button>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">My Submissions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/customer/new')}
        >
          New Request
        </Button>
      </Box>

      <Paper sx={{ height: 600 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : reviews.length === 0 ? (
          renderEmptyState()
        ) : (
          <DataGrid
            rows={reviews}
            columns={columns}
            initialState={{
              sorting: {
                sortModel: [{ field: 'submittedDate', sort: 'desc' }],
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
        )}
      </Paper>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel Review Request"
        message={`Are you sure you want to cancel "${cancelTarget?.subject}"? This action cannot be undone.`}
        confirmLabel="Cancel Review"
        confirmColor="error"
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </Box>
  );
}
