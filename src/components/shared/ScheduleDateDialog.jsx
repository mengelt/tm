import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState } from 'react';
import dayjs from 'dayjs';

export default function ScheduleDateDialog({
  open,
  title = 'Schedule Review',
  confirmLabel = 'Schedule',
  initialDate = null,
  onConfirm,
  onCancel,
}) {
  const [date, setDate] = useState(initialDate ? dayjs(initialDate) : null);

  const handleConfirm = () => {
    if (date) {
      onConfirm(date.toISOString());
      setDate(null);
    }
  };

  const handleCancel = () => {
    setDate(null);
    onCancel();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <DatePicker
          label="Review Date"
          value={date}
          onChange={setDate}
          minDate={dayjs().add(1, 'day')}
          slotProps={{
            textField: {
              fullWidth: true,
              sx: { mt: 1 },
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancel} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!date}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
