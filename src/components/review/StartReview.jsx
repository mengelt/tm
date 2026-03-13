import { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
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
  ListItemSecondaryAction,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemText as MenuItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddCommentIcon from '@mui/icons-material/AddComment';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import DeleteIcon from '@mui/icons-material/Delete';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import dayjs from 'dayjs';
import StatusChip from '../shared/StatusChip';
import ConfirmDialog from '../shared/ConfirmDialog';
import { VoteResult } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  fetchReviewById,
  addReviewNote,
  completeReview,
  returnToCustomer,
} from '../../mock/api';

const DEFAULT_REVIEWERS = [
  { name: 'David Chen', title: 'Senior Security Architect' },
  { name: 'Emily Park', title: 'Threat Modeling Lead' },
  { name: 'James Liu', title: 'Application Security Engineer' },
];

const AVAILABLE_REVIEWERS = [
  ...DEFAULT_REVIEWERS,
  { name: 'Sarah Kim', title: 'Security Analyst' },
  { name: 'Alex Rivera', title: 'Principal Security Engineer' },
  { name: 'Mia Thompson', title: 'Cloud Security Architect' },
];

export default function StartReview() {
  const { id } = useParams();
  const history = useHistory();
  const { user } = useAuth();

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState([]);
  const [actionItemText, setActionItemText] = useState('');
  const [actionItems, setActionItems] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [reviewers, setReviewers] = useState([...DEFAULT_REVIEWERS]);
  const [reviewerVotes, setReviewerVotes] = useState({
    'David Chen': null,
    'Emily Park': null,
    'James Liu': null,
  });
  const [reviewerComments, setReviewerComments] = useState({
    'David Chen': '',
    'Emily Park': '',
    'James Liu': '',
  });
  const [completing, setCompleting] = useState(false);
  const [returnDialog, setReturnDialog] = useState(false);
  const [addReviewerMenu, setAddReviewerMenu] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchReviewById(id).then((data) => {
      setReview(data);
      setNotes(data.reviewNotes || []);
      setAttachments(data.attachments || []);
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

  const handleAddActionItem = () => {
    if (!actionItemText.trim()) return;
    setActionItems((prev) => [
      ...prev,
      { id: `ai-${Date.now()}`, text: actionItemText.trim() },
    ]);
    setActionItemText('');
  };

  const handleRemoveActionItem = (itemId) => {
    setActionItems((prev) => prev.filter((a) => a.id !== itemId));
  };

  const handleDeleteAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleVoteChange = (reviewerName, newValue) => {
    setReviewerVotes((prev) => ({ ...prev, [reviewerName]: newValue }));
  };

  const handleCommentChange = (reviewerName, value) => {
    setReviewerComments((prev) => ({ ...prev, [reviewerName]: value }));
  };

  const handleAddReviewer = (reviewer) => {
    setReviewers((prev) => [...prev, reviewer]);
    setReviewerVotes((prev) => ({ ...prev, [reviewer.name]: null }));
    setReviewerComments((prev) => ({ ...prev, [reviewer.name]: '' }));
    setAddReviewerMenu(null);
  };

  const handleRemoveReviewer = (reviewerName) => {
    setReviewers((prev) => prev.filter((r) => r.name !== reviewerName));
    setReviewerVotes((prev) => {
      const next = { ...prev };
      delete next[reviewerName];
      return next;
    });
    setReviewerComments((prev) => {
      const next = { ...prev };
      delete next[reviewerName];
      return next;
    });
  };

  const availableToAdd = AVAILABLE_REVIEWERS.filter(
    (ar) => !reviewers.some((r) => r.name === ar.name)
  );

  const hasAnyReject = Object.values(reviewerVotes).some(
    (v) => v === VoteResult.REJECT
  );
  const allVotesCast = Object.values(reviewerVotes).every((v) => v !== null);

  const handleComplete = async () => {
    setCompleting(true);
    const votes = Object.entries(reviewerVotes)
      .filter(([, result]) => result !== null)
      .map(([voter, result]) => ({
        voter,
        result,
        comment: reviewerComments[voter] || '',
        timestamp: new Date().toISOString(),
      }));
    await completeReview(id, { notes, votes, actionItems });
    history.push('/team');
  };

  const handleReturn = async (reason) => {
    await returnToCustomer(id, reason);
    setReturnDialog(false);
    history.push('/team');
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getVoteColor = (value) => {
    if (value === VoteResult.ACCEPT) return 'success';
    if (value === VoteResult.ACCEPT_WITH_ACTIONS) return 'warning';
    if (value === VoteResult.REJECT) return 'error';
    return 'standard';
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5">{review.subject}</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
            <StatusChip status={review.status} />
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
            {attachments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                All attachments have been removed.
              </Typography>
            ) : (
              <List dense>
                {attachments.map((att, idx) => (
                  <ListItem key={idx} sx={{ pr: 10 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <InsertDriveFileIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={att.fileName}
                      secondary={`${att.type} — ${formatSize(att.fileSize)}`}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="AI Analysis">
                        <IconButton size="small" color="primary" sx={{ mr: 0.5 }}>
                          <AutoAwesomeIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete attachment">
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleDeleteAttachment(idx)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
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

        {/* Action Items */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <PlaylistAddCheckIcon sx={{ verticalAlign: 'text-bottom', mr: 1 }} />
              Action Items
            </Typography>

            {actionItems.length > 0 && (
              <Stack spacing={1} sx={{ mb: 2 }}>
                {actionItems.map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      pl: 2,
                      borderRadius: 2,
                      bgcolor: 'grey.50',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {item.text}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveActionItem(item.id)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                placeholder="Add an action item..."
                value={actionItemText}
                onChange={(e) => setActionItemText(e.target.value)}
                fullWidth
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddActionItem();
                  }
                }}
              />
              <Button
                variant="outlined"
                onClick={handleAddActionItem}
                disabled={!actionItemText.trim()}
              >
                Add
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Reviewer Votes */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <HowToVoteIcon sx={{ mr: 1 }} />
                Reviewer Decisions
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PersonAddIcon />}
                onClick={(e) => setAddReviewerMenu(e.currentTarget)}
                disabled={availableToAdd.length === 0}
              >
                Add Reviewer
              </Button>
              <Menu
                anchorEl={addReviewerMenu}
                open={Boolean(addReviewerMenu)}
                onClose={() => setAddReviewerMenu(null)}
              >
                {availableToAdd.map((r) => (
                  <MenuItem key={r.name} onClick={() => handleAddReviewer(r)}>
                    <MenuItemText primary={r.name} secondary={r.title} />
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            <Stack spacing={2}>
              {reviewers.map((reviewer) => {
                const vote = reviewerVotes[reviewer.name];
                return (
                  <Paper
                    key={reviewer.name}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      borderColor: vote === VoteResult.REJECT
                        ? 'error.300'
                        : vote === VoteResult.ACCEPT
                          ? 'success.300'
                          : vote === VoteResult.ACCEPT_WITH_ACTIONS
                            ? 'warning.300'
                            : 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box>
                          <Typography variant="subtitle2">{reviewer.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {reviewer.title}
                          </Typography>
                        </Box>
                        <Tooltip title="Remove reviewer">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveReviewer(reviewer.name)}
                            color="error"
                          >
                            <PersonRemoveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <ToggleButtonGroup
                        value={vote}
                        exclusive
                        onChange={(_, v) => {
                          if (v !== null) handleVoteChange(reviewer.name, v);
                        }}
                        size="small"
                      >
                        <ToggleButton
                          value={VoteResult.REJECT}
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            fontSize: '0.75rem',
                            '&.Mui-selected': {
                              bgcolor: 'error.main',
                              color: 'white',
                              '&:hover': { bgcolor: 'error.dark' },
                            },
                          }}
                        >
                          Reject
                        </ToggleButton>
                        <ToggleButton
                          value={VoteResult.ACCEPT_WITH_ACTIONS}
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            fontSize: '0.75rem',
                            '&.Mui-selected': {
                              bgcolor: 'warning.main',
                              color: 'white',
                              '&:hover': { bgcolor: 'warning.dark' },
                            },
                          }}
                        >
                          Accept w/ Actions
                        </ToggleButton>
                        <ToggleButton
                          value={VoteResult.ACCEPT}
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            fontSize: '0.75rem',
                            '&.Mui-selected': {
                              bgcolor: 'success.main',
                              color: 'white',
                              '&:hover': { bgcolor: 'success.dark' },
                            },
                          }}
                        >
                          Accept
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>
                    <TextField
                      size="small"
                      placeholder="Optional comment..."
                      value={reviewerComments[reviewer.name]}
                      onChange={(e) => handleCommentChange(reviewer.name, e.target.value)}
                      fullWidth
                      multiline
                      maxRows={2}
                      sx={{ mt: 1.5 }}
                    />
                  </Paper>
                );
              })}
            </Stack>

            {hasAnyReject && (
              <Alert severity="error" sx={{ mt: 2 }}>
                One or more reviewers have rejected. The review cannot be completed until all rejections are resolved.
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', pb: 4 }}>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<AssignmentReturnIcon />}
            onClick={() => setReturnDialog(true)}
          >
            Return to Customer
          </Button>
          <Tooltip
            title={
              hasAnyReject
                ? 'Cannot complete — a reviewer has rejected'
                : !allVotesCast
                  ? 'All reviewers must cast their vote'
                  : ''
            }
          >
            <span>
              <Button
                variant="contained"
                color="success"
                startIcon={completing ? <CircularProgress size={16} /> : <CheckCircleIcon />}
                onClick={handleComplete}
                disabled={completing || hasAnyReject || !allVotesCast}
              >
                Complete Review
              </Button>
            </span>
          </Tooltip>
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
