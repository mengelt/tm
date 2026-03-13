import { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EventIcon from '@mui/icons-material/Event';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import CancelIcon from '@mui/icons-material/Cancel';
import dayjs from 'dayjs';
import StatusChip from '../shared/StatusChip';
import ConfirmDialog from '../shared/ConfirmDialog';
import ScheduleDateDialog from '../shared/ScheduleDateDialog';
import {
  fetchReviewById,
  returnToCustomer,
  scheduleReview,
  cancelReview,
} from '../../mock/api';

export default function IntakeDetail() {
  const { id } = useParams();
  const history = useHistory();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [returnDialog, setReturnDialog] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [scheduleDialog, setScheduleDialog] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchReviewById(id).then((data) => {
      setReview(data);
      setLoading(false);
    });
  }, [id]);

  const handleReturn = async (reason) => {
    await returnToCustomer(id, reason);
    setReturnDialog(false);
    history.push('/team');
  };

  const handleCancel = async () => {
    await cancelReview(id);
    setCancelDialog(false);
    history.push('/team');
  };

  const handleSchedule = async (date) => {
    await scheduleReview(id, date);
    setScheduleDialog(false);
    history.push('/team');
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => history.push('/team')}
        sx={{ mb: 2 }}
      >
        Back to Queue
      </Button>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h5">{review.subject}</Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
          <StatusChip status={review.status} />
          {review.urgent && <Chip label="URGENT" color="error" size="small" />}
        </Box>
      </Box>

      <Stack spacing={3}>
        {/* Request Details */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Request Details</Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Submitted By</Typography>
                  <Typography variant="body2">{review.submittedBy.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body2">{review.submittedBy.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Submitted</Typography>
                  <Typography variant="body2">{dayjs(review.submittedDate).format('MMM D, YYYY')}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Need By</Typography>
                  <Typography variant="body2">{dayjs(review.needByDate).format('MMM D, YYYY')}</Typography>
                </Box>
                {review.esatsId && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">ESATS ID</Typography>
                    <Typography variant="body2">{review.esatsId}</Typography>
                  </Box>
                )}
              </Box>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.secondary">Description</Typography>
                <Typography variant="body2">{review.description}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Attachments */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Attachments</Typography>
            <List dense>
              {review.attachments.map((att, idx) => (
                <ListItem key={idx} sx={{ pr: 6 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <InsertDriveFileIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={att.fileName}
                    secondary={`${att.type} — ${formatSize(att.fileSize)}`}
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="AI Analysis">
                      <IconButton edge="end" size="small" color="primary">
                        <AutoAwesomeIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Actions */}
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 4 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<AssignmentReturnIcon />}
              onClick={() => setReturnDialog(true)}
            >
              Return to Customer
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={() => setCancelDialog(true)}
            >
              Cancel Review
            </Button>
          </Box>
          <Button
            variant="contained"
            startIcon={<EventIcon />}
            onClick={() => setScheduleDialog(true)}
          >
            Schedule Review
          </Button>
        </Box>
      </Stack>

      {/* Return to Customer Dialog */}
      <ConfirmDialog
        open={returnDialog}
        title="Return to Customer"
        message={`Return "${review.subject}" to the customer for rework. Please provide a reason.`}
        confirmLabel="Return to Customer"
        confirmColor="warning"
        showReasonField
        reasonLabel="Reason for return"
        onConfirm={handleReturn}
        onCancel={() => setReturnDialog(false)}
      />

      {/* Cancel Dialog */}
      <ConfirmDialog
        open={cancelDialog}
        title="Cancel Review"
        message={`Are you sure you want to cancel "${review.subject}"? This action cannot be undone.`}
        confirmLabel="Cancel Review"
        confirmColor="error"
        onConfirm={handleCancel}
        onCancel={() => setCancelDialog(false)}
      />

      {/* Schedule Dialog */}
      <ScheduleDateDialog
        open={scheduleDialog}
        title="Schedule Review"
        confirmLabel="Schedule"
        onConfirm={handleSchedule}
        onCancel={() => setScheduleDialog(false)}
      />
    </Box>
  );
}
