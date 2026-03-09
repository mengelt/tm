import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Tabs, Tab, Badge, Chip } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import QueueTab from './QueueTab';
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
  returnToCustomer,
  scheduleReview,
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [returnDialog, setReturnDialog] = useState({ open: false, review: null });
  const [cancelDialog, setCancelDialog] = useState({ open: false, review: null });
  const [scheduleDialog, setScheduleDialog] = useState({ open: false, review: null, isReschedule: false });

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
  const handleReturn = async (reason) => {
    await returnToCustomer(returnDialog.review.id, reason);
    setReturnDialog({ open: false, review: null });
    loadData();
  };

  const handleCancel = async () => {
    await cancelReview(cancelDialog.review.id);
    setCancelDialog({ open: false, review: null });
    loadData();
  };

  const handleSchedule = async (date) => {
    if (scheduleDialog.isReschedule) {
      await rescheduleReview(scheduleDialog.review.id, date);
    } else {
      await scheduleReview(scheduleDialog.review.id, date);
    }
    setScheduleDialog({ open: false, review: null, isReschedule: false });
    loadData();
  };

  // Build columns per status
  const columnsByTab = [
    getIntakeReviewColumns({
      onReturn: (row) => setReturnDialog({ open: true, review: row }),
      onSchedule: (row) => setScheduleDialog({ open: true, review: row, isReschedule: false }),
      onCancel: (row) => setCancelDialog({ open: true, review: row }),
    }),
    getCustomerWorkColumns(),
    getScheduledColumns({
      onStart: (row) => navigate(`/team/review/${row.id}`),
      onReschedule: (row) => setScheduleDialog({ open: true, review: row, isReschedule: true }),
      onCancel: (row) => setCancelDialog({ open: true, review: row }),
    }),
    getCompletedColumns({
      onView: (row) => navigate(`/team/review/${row.id}/view`),
    }),
    getCanceledColumns(),
  ];

  const currentStatus = STATUS_TABS[activeTab].status;
  const currentRows = reviewsByStatus[currentStatus] || [];
  const currentColumns = columnsByTab[activeTab];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Review Queue
      </Typography>

      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{
          mb: 2,
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
            label={
              <Badge
                badgeContent={reviewsByStatus[status]?.length || 0}
                color="primary"
                sx={{ '& .MuiBadge-badge': { right: -16, top: -2 } }}
              >
                <Box sx={{ pr: 1.5 }}>{label}</Box>
              </Badge>
            }
            sx={{ gap: 0.5 }}
          />
        ))}
      </Tabs>

      <QueueTab rows={currentRows} columns={currentColumns} loading={loading} />

      {/* Return to Customer Dialog */}
      <ConfirmDialog
        open={returnDialog.open}
        title="Return to Customer"
        message={`Return "${returnDialog.review?.subject}" to the customer for rework. Please provide a reason.`}
        confirmLabel="Return to Customer"
        confirmColor="warning"
        showReasonField
        reasonLabel="Reason for return"
        onConfirm={handleReturn}
        onCancel={() => setReturnDialog({ open: false, review: null })}
      />

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

      {/* Schedule / Reschedule Dialog */}
      <ScheduleDateDialog
        open={scheduleDialog.open}
        title={scheduleDialog.isReschedule ? 'Reschedule Review' : 'Schedule Review'}
        confirmLabel={scheduleDialog.isReschedule ? 'Reschedule' : 'Schedule'}
        initialDate={scheduleDialog.isReschedule ? scheduleDialog.review?.scheduledDate : null}
        onConfirm={handleSchedule}
        onCancel={() => setScheduleDialog({ open: false, review: null, isReschedule: false })}
      />
    </Box>
  );
}
