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
  CircularProgress,
  Stack,
  Chip,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningIcon from '@mui/icons-material/Warning';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import dayjs from 'dayjs';
import StatusChip from '../shared/StatusChip';
import { VoteResult } from '../../types';
import { fetchReviewById } from '../../mock/api';

function getVoteChipProps(result) {
  if (result === VoteResult.ACCEPT) return { color: 'success', icon: <CheckCircleIcon /> };
  if (result === VoteResult.ACCEPT_WITH_ACTIONS) return { color: 'warning', icon: <WarningIcon /> };
  if (result === VoteResult.REJECT) return { color: 'error', icon: <CancelIcon /> };
  return { color: 'default' };
}

export default function ViewReview() {
  const { id } = useParams();
  const history = useHistory();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewById(id).then((data) => {
      setReview(data);
      setLoading(false);
    });
  }, [id]);

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

  const accepts = review.reviewVotes.filter((v) => v.result === VoteResult.ACCEPT).length;
  const acceptsWithActions = review.reviewVotes.filter((v) => v.result === VoteResult.ACCEPT_WITH_ACTIONS).length;
  const rejects = review.reviewVotes.filter((v) => v.result === VoteResult.REJECT).length;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => history.goBack()}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5">{review.subject}</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
            <StatusChip status={review.status} />
            <Typography variant="body2" color="text.secondary">
              {review.id}
            </Typography>
          </Box>
        </Box>
        {review.reviewVotes.length > 0 && (
          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Vote Summary
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
              <Box>
                <Typography variant="h6" color="success.main" fontWeight={700}>{accepts}</Typography>
                <Typography variant="caption" color="text.secondary">Accept</Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="h6" color="warning.main" fontWeight={700}>{acceptsWithActions}</Typography>
                <Typography variant="caption" color="text.secondary">w/ Actions</Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box>
                <Typography variant="h6" color="error.main" fontWeight={700}>{rejects}</Typography>
                <Typography variant="caption" color="text.secondary">Reject</Typography>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>

      <Stack spacing={3}>
        {/* Details */}
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
                {review.scheduledDate && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Review Date</Typography>
                    <Typography variant="body2">{dayjs(review.scheduledDate).format('MMM D, YYYY')}</Typography>
                  </Box>
                )}
                {review.urgent && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Priority</Typography>
                    <Chip label="URGENT" color="error" size="small" />
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
                <ListItem key={idx}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <InsertDriveFileIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={att.fileName}
                    secondary={`${att.type} — ${formatSize(att.fileSize)}`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>

        {/* Review Notes */}
        {review.reviewNotes.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Review Notes</Typography>
              <Stack spacing={1}>
                {review.reviewNotes.map((note) => (
                  <Paper key={note.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                    <Typography variant="body2">{note.text}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {note.author} — {dayjs(note.timestamp).format('MMM D, YYYY h:mm A')}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Action Items */}
        {review.actionItems && review.actionItems.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <PlaylistAddCheckIcon sx={{ verticalAlign: 'text-bottom', mr: 1 }} />
                Action Items
              </Typography>
              <Stack spacing={1}>
                {review.actionItems.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.5,
                      pl: 2,
                      borderRadius: 2,
                      bgcolor: 'grey.50',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2">{item.text}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Votes */}
        {review.reviewVotes.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Reviewer Decisions</Typography>
              <Stack spacing={1}>
                {review.reviewVotes.map((vote, idx) => {
                  const chipProps = getVoteChipProps(vote.result);
                  return (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {vote.voter}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(vote.timestamp).format('MMM D, YYYY h:mm A')}
                        </Typography>
                      </Box>
                      <Chip
                        label={vote.result}
                        size="small"
                        color={chipProps.color}
                        icon={chipProps.icon}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
}
