import dayjs from 'dayjs';
import StatusChip from '../../shared/StatusChip';

export const idColumn = {
  field: 'id',
  headerName: 'ID',
  width: 145,
};

export const idColumnPending = {
  field: 'id',
  headerName: 'ID',
  width: 145,
  renderCell: () => (
    <span style={{ color: '#9e9e9e', fontStyle: 'italic' }}>N/A</span>
  ),
};

export const subjectColumn = {
  field: 'subject',
  headerName: 'Subject',
  flex: 1,
  minWidth: 250,
};

export const statusColumn = {
  field: 'status',
  headerName: 'Status',
  width: 180,
  renderCell: (params) => <StatusChip status={params.value} />,
};

export const urgentColumn = {
  field: 'urgent',
  headerName: 'Urgent',
  width: 90,
  type: 'boolean',
};

export const submitterColumn = {
  field: 'submittedBy',
  headerName: 'Submitted By',
  width: 160,
  valueGetter: (value) => value?.name || '—',
};

export const submittedDateColumn = {
  field: 'submittedDate',
  headerName: 'Submitted',
  width: 120,
  valueFormatter: (value) => (value ? dayjs(value).format('MMM D, YYYY') : '—'),
};

export const needByDateColumn = {
  field: 'needByDate',
  headerName: 'Need By',
  width: 120,
  valueFormatter: (value) => (value ? dayjs(value).format('MMM D, YYYY') : '—'),
};

export const scheduledDateColumn = {
  field: 'scheduledDate',
  headerName: 'Scheduled',
  width: 130,
  valueFormatter: (value) => (value ? dayjs(value).format('MMM D, YYYY') : '—'),
};
