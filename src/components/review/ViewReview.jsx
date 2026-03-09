import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import dayjs from 'dayjs';
import StatusChip from '../shared/StatusChip';
import { VoteResult } from '../../types';
import { fetchReviewById } from '../../mock/api';

export default function ViewReview() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const approves = review.reviewVotes.filter((v) => v.result === VoteResult.APPROVE).length;
  const rejects = review.reviewVotes.filter((v) => v.result === VoteResult.REJECT).length;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
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
            <Typography variant="caption" color="text.secondary" display="block">
              Vote Summary
            </Typography>
            <Typography variant="h6">
              <Typography component="span" color="success.main" fontWeight={700}>
                {approves}
              </Typography>
              {' / '}
              <Typography component="span" color="error.main" fontWeight={700}>
                {rejects}
              </Typography>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Approve / Reject
            </Typography>
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

        {/* Votes */}
        {review.reviewVotes.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Review Votes</Typography>
              <Stack spacing={1}>
                {review.reviewVotes.map((vote, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: vote.result === VoteResult.APPROVE ? 'success.50' : 'error.50',
                      border: '1px solid',
                      borderColor: vote.result === VoteResult.APPROVE ? 'success.200' : 'error.200',
                    }}
                  >
                    {vote.result === VoteResult.APPROVE ? (
                      <ThumbUpIcon color="success" />
                    ) : (
                      <ThumbDownIcon color="error" />
                    )}
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
                      color={vote.result === VoteResult.APPROVE ? 'success' : 'error'}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
}
