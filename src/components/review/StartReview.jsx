import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AddCommentIcon from '@mui/icons-material/AddComment';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import DeleteIcon from '@mui/icons-material/Delete';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import dayjs from 'dayjs';
import StatusChip from '../shared/StatusChip';
import ConfirmDialog from '../shared/ConfirmDialog';
import { VoteResult } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  fetchReviewById,
  addReviewNote,
  addReviewVote,
  completeReview,
  returnToCustomer,
} from '../../mock/api';

export default function StartReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [voterName, setVoterName] = useState('');
  const [voteValue, setVoteValue] = useState(null);
  const [notes, setNotes] = useState([]);
  const [votes, setVotes] = useState([]);
  const [completing, setCompleting] = useState(false);
  const [returnDialog, setReturnDialog] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchReviewById(id).then((data) => {
      setReview(data);
      setNotes(data.reviewNotes || []);
      setVotes(data.reviewVotes || []);
      setLoading(false);
    });
  }, [id]);

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    const note = {
      id: `n-${Date.now()}`,
      text: noteText.trim(),
      author: user.name,
      timestamp: new Date().toISOString(),
    };
    setNotes((prev) => [...prev, note]);
    addReviewNote(id, note);
    setNoteText('');
  };

  const handleRemoveNote = (noteId) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  const handleAddVote = () => {
    if (!voterName.trim() || !voteValue) return;
    const vote = {
      voter: voterName.trim(),
      result: voteValue,
      timestamp: new Date().toISOString(),
    };
    setVotes((prev) => [...prev, vote]);
    addReviewVote(id, vote);
    setVoterName('');
    setVoteValue(null);
  };

  const handleComplete = async () => {
    setCompleting(true);
    await completeReview(id, { notes, votes });
    navigate('/team');
  };

  const handleReturn = async (reason) => {
    await returnToCustomer(id, reason);
    setReturnDialog(false);
    navigate('/team');
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
        onClick={() => navigate('/team')}
        sx={{ mb: 2 }}
      >
        Back to Queue
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5">{review.subject}</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
            <StatusChip status={review.status} />
            <Typography variant="body2" color="text.secondary">
              {review.id}
            </Typography>
            {review.urgent && <Chip label="URGENT" color="error" size="small" />}
          </Box>
        </Box>
      </Box>

      <Stack spacing={3}>
        {/* Review Details */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Request Details</Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', gap: 4 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Submitted By</Typography>
                  <Typography variant="body2">{review.submittedBy.name}</Typography>
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
                    <Typography variant="caption" color="text.secondary">Scheduled</Typography>
                    <Typography variant="body2">{dayjs(review.scheduledDate).format('MMM D, YYYY')}</Typography>
                  </Box>
                )}
              </Box>
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
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <AddCommentIcon sx={{ verticalAlign: 'text-bottom', mr: 1 }} />
              Review Notes
            </Typography>

            {notes.length > 0 && (
              <Stack spacing={1} sx={{ mb: 2 }}>
                {notes.map((note) => (
                  <Paper key={note.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body2">{note.text}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {note.author} — {dayjs(note.timestamp).format('MMM D, YYYY h:mm A')}
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={() => handleRemoveNote(note.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Add a review note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                fullWidth
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddNote();
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={handleAddNote}
                disabled={!noteText.trim()}
              >
                Add
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Votes */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <HowToVoteIcon sx={{ verticalAlign: 'text-bottom', mr: 1 }} />
              Review Votes
            </Typography>

            {votes.length > 0 && (
              <Stack spacing={1} sx={{ mb: 2 }}>
                {votes.map((vote, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1,
                      borderRadius: 1,
                      bgcolor: vote.result === VoteResult.APPROVE ? 'success.50' : 'error.50',
                    }}
                  >
                    {vote.result === VoteResult.APPROVE ? (
                      <ThumbUpIcon color="success" fontSize="small" />
                    ) : (
                      <ThumbDownIcon color="error" fontSize="small" />
                    )}
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {vote.voter}
                    </Typography>
                    <Chip
                      label={vote.result}
                      size="small"
                      color={vote.result === VoteResult.APPROVE ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </Box>
                ))}
              </Stack>
            )}

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Voter name"
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
                sx={{ flex: 1 }}
              />
              <ToggleButtonGroup
                value={voteValue}
                exclusive
                onChange={(_, v) => setVoteValue(v)}
                size="small"
              >
                <ToggleButton value={VoteResult.APPROVE} color="success">
                  <ThumbUpIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton value={VoteResult.REJECT} color="error">
                  <ThumbDownIcon fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
              <Button
                variant="outlined"
                onClick={handleAddVote}
                disabled={!voterName.trim() || !voteValue}
              >
                Vote
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Actions */}
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<AssignmentReturnIcon />}
            onClick={() => setReturnDialog(true)}
          >
            Return to Customer
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={completing ? <CircularProgress size={16} /> : <CheckCircleIcon />}
            onClick={handleComplete}
            disabled={completing}
          >
            Complete Review
          </Button>
        </Box>
      </Stack>

      <ConfirmDialog
        open={returnDialog}
        title="Return to Customer"
        message="Return this review to the customer for rework. Please provide a reason."
        confirmLabel="Return to Customer"
        confirmColor="warning"
        showReasonField
        reasonLabel="Reason for return"
        onConfirm={handleReturn}
        onCancel={() => setReturnDialog(false)}
      />
    </Box>
  );
}
