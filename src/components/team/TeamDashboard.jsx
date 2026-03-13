import { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Button, Card, CardContent, Divider } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ViewListIcon from '@mui/icons-material/ViewList';
import QueueTab from './QueueTab';
import CalendarView from './CalendarView';
import ConfirmDialog from '../shared/ConfirmDialog';
import ScheduleDateDialog from '../shared/ScheduleDateDialog';
import getIntakeReviewColumns from './columns/intakeReviewColumns';
import getCustomerWorkColumns from './columns/customerWorkColumns';
import getScheduledColumns from './columns/scheduledColumns';
import getCompletedColumns from './columns/completedColumns';
import getCanceledColumns from './columns/canceledColumns';
import { ReviewStatus } from '../../types';
import {
  fetchReviews,
  rescheduleReview,
  cancelReview,
} from '../../mock/api';

const STATUS_TABS = [
  { status: ReviewStatus.INTAKE_REVIEW, label: 'Intake Review', icon: <InboxIcon /> },
  { status: ReviewStatus.CUSTOMER_WORK_NEEDED, label: 'Customer Rework', icon: <AssignmentReturnIcon /> },
  { status: ReviewStatus.TM_REVIEW_SCHEDULED, label: 'Scheduled', icon: <EventIcon /> },
  { status: ReviewStatus.TM_REVIEW_COMPLETE, label: 'Completed', icon: <CheckCircleIcon /> },
  { status: ReviewStatus.CANCELED, label: 'Canceled', icon: <BlockIcon /> },
];

export default function TeamDashboard() {
  const history = useHistory();
  const [activeTab, setActiveTab] = useState(0);
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarView, setCalendarView] = useState(false);

  // Dialog state
  const [cancelDialog, setCancelDialog] = useState({ open: false, review: null });
  const [scheduleDialog, setScheduleDialog] = useState({ open: false, review: null });

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await fetchReviews();
    setAllReviews(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Group reviews by status
  const reviewsByStatus = {};
  STATUS_TABS.forEach(({ status }) => {
    reviewsByStatus[status] = allReviews.filter((r) => r.status === status);
  });

  // Action handlers
  const handleCancel = async () => {
    await cancelReview(cancelDialog.review.id);
    setCancelDialog({ open: false, review: null });
    loadData();
  };

  const handleReschedule = async (date) => {
    await rescheduleReview(scheduleDialog.review.id, date);
    setScheduleDialog({ open: false, review: null });
    loadData();
  };

  // Build columns per status
  const columnsByTab = [
    getIntakeReviewColumns({
      onViewDetails: (row) => history.push(`/team/intake/${row.id}`),
    }),
    getCustomerWorkColumns(),
    getScheduledColumns({
      onStart: (row) => history.push(`/team/review/${row.id}`),
      onReschedule: (row) => setScheduleDialog({ open: true, review: row }),
      onCancel: (row) => setCancelDialog({ open: true, review: row }),
    }),
    getCompletedColumns({
      onView: (row) => history.push(`/team/review/${row.id}/view`),
    }),
    getCanceledColumns(),
  ];

  const currentStatus = STATUS_TABS[activeTab].status;
  const isScheduledTab = currentStatus === ReviewStatus.TM_REVIEW_SCHEDULED;
  const currentRows = reviewsByStatus[currentStatus] || [];
  const currentColumns = columnsByTab[activeTab];

  return (
    <Box>
      <Card>
        <CardContent sx={{ pb: 0 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Review Queue
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => { setActiveTab(v); setCalendarView(false); }}
              sx={{
                flexGrow: 1,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  minHeight: 48,
                  px: 3,
                },
              }}
            >
              {STATUS_TABS.map(({ status, label, icon }) => (
                <Tab
                  key={status}
                  icon={icon}
                  iconPosition="start"
                  label={label}
                  sx={{ gap: 0.5 }}
                />
              ))}
            </Tabs>
            {isScheduledTab && (
              <Button
                variant={calendarView ? 'contained' : 'outlined'}
                size="small"
                startIcon={calendarView ? <ViewListIcon /> : <CalendarMonthIcon />}
                onClick={() => setCalendarView((v) => !v)}
                sx={{ ml: 2, whiteSpace: 'nowrap' }}
              >
                {calendarView ? 'List View' : 'Calendar View'}
              </Button>
            )}
          </Box>
        </CardContent>

        <Divider />

        <CardContent sx={{ pt: 2 }}>
          {isScheduledTab && calendarView ? (
            <CalendarView
              rows={currentRows}
              onStart={(row) => history.push(`/team/review/${row.id}`)}
              onReschedule={(row) => setScheduleDialog({ open: true, review: row })}
              onCancel={(row) => setCancelDialog({ open: true, review: row })}
            />
          ) : (
            <QueueTab rows={currentRows} columns={currentColumns} loading={loading} />
          )}
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <ConfirmDialog
        open={cancelDialog.open}
        title="Cancel Review"
        message={`Are you sure you want to cancel "${cancelDialog.review?.subject}"? This action cannot be undone.`}
        confirmLabel="Cancel Review"
        confirmColor="error"
        onConfirm={handleCancel}
        onCancel={() => setCancelDialog({ open: false, review: null })}
      />

      {/* Reschedule Dialog */}
      <ScheduleDateDialog
        open={scheduleDialog.open}
        title="Reschedule Review"
        confirmLabel="Reschedule"
        initialDate={scheduleDialog.review?.scheduledDate}
        onConfirm={handleReschedule}
        onCancel={() => setScheduleDialog({ open: false, review: null })}
      />
    </Box>
  );
}
