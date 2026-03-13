import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import CancelIcon from '@mui/icons-material/Cancel';
import dayjs from 'dayjs';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView({ rows, onStart, onReschedule, onCancel }) {
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));

  const handlePrev = () => setCurrentMonth((m) => m.subtract(1, 'month'));
  const handleNext = () => setCurrentMonth((m) => m.add(1, 'month'));

  const calendarDays = useMemo(() => {
    const start = currentMonth.startOf('week');
    const end = currentMonth.endOf('month').endOf('week');
    const days = [];
    let day = start;
    while (day.isBefore(end) || day.isSame(end, 'day')) {
      days.push(day);
      day = day.add(1, 'day');
    }
    return days;
  }, [currentMonth]);

  const reviewsByDate = useMemo(() => {
    const map = {};
    rows.forEach((r) => {
      if (!r.scheduledDate) return;
      const key = dayjs(r.scheduledDate).format('YYYY-MM-DD');
      if (!map[key]) map[key] = [];
      map[key].push(r);
    });
    return map;
  }, [rows]);

  const today = dayjs().format('YYYY-MM-DD');

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, gap: 2 }}>
        <IconButton onClick={handlePrev} size="small">
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6" sx={{ minWidth: 180, textAlign: 'center' }}>
          {currentMonth.format('MMMM YYYY')}
        </Typography>
        <IconButton onClick={handleNext} size="small">
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Weekday headers */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 0.5 }}>
        {WEEKDAYS.map((wd) => (
          <Typography
            key={wd}
            variant="caption"
            sx={{ textAlign: 'center', fontWeight: 600, color: 'text.secondary', py: 0.5 }}
          >
            {wd}
          </Typography>
        ))}
      </Box>

      {/* Calendar grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
        {calendarDays.map((day) => {
          const key = day.format('YYYY-MM-DD');
          const isCurrentMonth = day.month() === currentMonth.month();
          const isToday = key === today;
          const reviews = reviewsByDate[key] || [];

          return (
            <Paper
              key={key}
              variant="outlined"
              sx={{
                minHeight: 100,
                p: 0.75,
                bgcolor: isToday ? 'primary.50' : isCurrentMonth ? '#fff' : 'grey.50',
                borderColor: isToday ? 'primary.main' : 'divider',
                opacity: isCurrentMonth ? 1 : 0.5,
                overflow: 'hidden',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: isToday ? 700 : 400,
                  color: isToday ? 'primary.main' : 'text.secondary',
                  display: 'block',
                  mb: 0.5,
                }}
              >
                {day.format('D')}
              </Typography>

              {reviews.map((r) => (
                <Box
                  key={r.id}
                  sx={{
                    mb: 0.5,
                    p: 0.5,
                    borderRadius: 1,
                    bgcolor: r.urgent ? 'error.50' : 'primary.50',
                    border: '1px solid',
                    borderColor: r.urgent ? 'error.200' : 'primary.100',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      display: 'block',
                      lineHeight: 1.3,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '0.7rem',
                    }}
                  >
                    {r.subject}
                  </Typography>
                  {r.urgent && (
                    <Chip label="URGENT" size="small" color="error" sx={{ height: 16, fontSize: '0.6rem', mt: 0.25 }} />
                  )}
                  <Box sx={{ display: 'flex', gap: 0, mt: 0.25 }}>
                    <Tooltip title="Start Review">
                      <IconButton size="small" onClick={() => onStart(r)} sx={{ p: 0.25 }}>
                        <PlayArrowIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reschedule">
                      <IconButton size="small" onClick={() => onReschedule(r)} sx={{ p: 0.25 }}>
                        <EventRepeatIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cancel">
                      <IconButton size="small" onClick={() => onCancel(r)} sx={{ p: 0.25 }}>
                        <CancelIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              ))}
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}
