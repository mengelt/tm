import { Chip } from '@mui/material';
import { ReviewStatus } from '../../types';

const statusConfig = {
  [ReviewStatus.CUSTOMER_WORK_NEEDED]: { color: 'warning', label: 'Customer Work Needed' },
  [ReviewStatus.INTAKE_REVIEW]: { color: 'info', label: 'Intake Review' },
  [ReviewStatus.TM_REVIEW_SCHEDULED]: { color: 'primary', label: 'Review Scheduled' },
  [ReviewStatus.TM_REVIEW_COMPLETE]: { color: 'success', label: 'Complete' },
  [ReviewStatus.CANCELED]: { color: 'default', label: 'Canceled' },
};

export default function StatusChip({ status, size = 'small' }) {
  const config = statusConfig[status] || { color: 'default', label: status };
  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      variant="filled"
    />
  );
}
