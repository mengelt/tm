import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Stack,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import dayjs from 'dayjs';
import FileUploadField from '../shared/FileUploadField';
import { AttachmentType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { submitReview, resubmitReview, fetchReviewById, validateEsatsId } from '../../mock/api';

const attachmentTypes = [
  AttachmentType.TMR_QUESTIONNAIRE,
  AttachmentType.DATA_FLOW_DIAGRAM,
  AttachmentType.THREAT_FINDINGS_REPORT,
];

export default function IntakeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [returnReason, setReturnReason] = useState(null);

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [needByDate, setNeedByDate] = useState(null);
  const [urgent, setUrgent] = useState(false);
  const [esatsId, setEsatsId] = useState('');
  const [esatsValidating, setEsatsValidating] = useState(false);
  const [esatsValidation, setEsatsValidation] = useState(null); // { valid, message }
  const [files, setFiles] = useState({
    [AttachmentType.TMR_QUESTIONNAIRE]: null,
    [AttachmentType.DATA_FLOW_DIAGRAM]: null,
    [AttachmentType.THREAT_FINDINGS_REPORT]: null,
  });

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      fetchReviewById(id).then((review) => {
        setSubject(review.subject);
        setDescription(review.description);
        setNeedByDate(dayjs(review.needByDate));
        setUrgent(review.urgent);
        setReturnReason(review.returnReason);
        if (review.esatsId) {
          setEsatsId(review.esatsId);
          setEsatsValidation({ valid: true, message: 'Previously validated.' });
        }
        const existingFiles = {};
        review.attachments.forEach((a) => {
          existingFiles[a.type] = new File([''], a.fileName, { type: 'application/octet-stream' });
          Object.defineProperty(existingFiles[a.type], 'size', { value: a.fileSize });
        });
        setFiles(existingFiles);
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const handleEsatsChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setEsatsId(val);
    setEsatsValidation(null);
  };

  const handleValidateEsats = async () => {
    if (!esatsId.trim()) return;
    setEsatsValidating(true);
    const result = await validateEsatsId(esatsId);
    setEsatsValidation(result);
    setEsatsValidating(false);
  };

  const allFilesUploaded = attachmentTypes.every((type) => files[type] !== null);
  const esatsValid = esatsValidation?.valid === true;
  const formValid = subject.trim() && description.trim() && needByDate && allFilesUploaded && esatsValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formValid) return;

    setSubmitting(true);
    const payload = {
      subject,
      description,
      needByDate: needByDate.toISOString(),
      urgent,
      esatsId,
      submittedBy: { id: user.id, name: user.name, email: user.email },
      attachments: attachmentTypes.map((type) => ({
        type,
        fileName: files[type].name,
        fileSize: files[type].size,
      })),
    };

    try {
      if (isEdit) {
        await resubmitReview(id, payload);
      } else {
        await submitReview(payload);
      }
      navigate('/customer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/customer')}
        sx={{ mb: 2 }}
      >
        Back to Dashboard
      </Button>

      <Typography variant="h5" gutterBottom>
        {isEdit ? 'Re-Submit Review Request' : 'New Threat Model Review Request'}
      </Typography>

      {returnReason && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Returned by TM Team:
          </Typography>
          {returnReason}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                fullWidth
              />

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                  label="ESATS ID"
                  value={esatsId}
                  onChange={handleEsatsChange}
                  required
                  placeholder="Enter numeric ESATS ID"
                  sx={{ flex: 1 }}
                  InputProps={{
                    endAdornment: esatsValidation && (
                      <InputAdornment position="end">
                        {esatsValidation.valid ? (
                          <CheckCircleIcon color="success" />
                        ) : (
                          <ErrorIcon color="error" />
                        )}
                      </InputAdornment>
                    ),
                  }}
                  error={esatsValidation?.valid === false}
                  helperText={esatsValidation?.message || ''}
                  color={esatsValidation?.valid ? 'success' : undefined}
                />
                <Button
                  variant="outlined"
                  onClick={handleValidateEsats}
                  disabled={!esatsId.trim() || esatsValidating}
                  sx={{ mt: 1, minWidth: 100 }}
                >
                  {esatsValidating ? <CircularProgress size={20} /> : 'Validate'}
                </Button>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <DatePicker
                  label="Need By Date"
                  value={needByDate}
                  onChange={setNeedByDate}
                  slotProps={{
                    textField: { required: true, fullWidth: true },
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={urgent}
                      onChange={(e) => setUrgent(e.target.checked)}
                    />
                  }
                  label="Urgent"
                  sx={{ whiteSpace: 'nowrap' }}
                />
              </Box>

              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                fullWidth
                multiline
                rows={4}
              />

              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Required Attachments
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  All three attachment types must be uploaded before submitting.
                </Typography>
                <Stack spacing={2}>
                  {attachmentTypes.map((type) => (
                    <FileUploadField
                      key={type}
                      label={type}
                      file={files[type]}
                      onFileSelect={(file) =>
                        setFiles((prev) => ({ ...prev, [type]: file }))
                      }
                      onFileRemove={() =>
                        setFiles((prev) => ({ ...prev, [type]: null }))
                      }
                    />
                  ))}
                </Stack>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/customer')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!formValid || submitting}
                  startIcon={submitting ? <CircularProgress size={16} /> : <SendIcon />}
                >
                  {isEdit ? 'Re-Submit Request' : 'Submit Request'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
