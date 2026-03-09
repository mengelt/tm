import { GridActionsCellItem } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  idColumn,
  subjectColumn,
  submitterColumn,
  needByDateColumn,
  scheduledDateColumn,
} from './shared';

export default function getCompletedColumns({ onView }) {
  return [
    idColumn,
    subjectColumn,
    submitterColumn,
    needByDateColumn,
    scheduledDateColumn,
    {
      field: 'reviewVotes',
      headerName: 'Outcome',
      width: 120,
      valueGetter: (value) => {
        if (!value || value.length === 0) return '—';
        const accepts = value.filter((v) => v.result === 'Accept').length;
        const withActions = value.filter((v) => v.result === 'Accept with Actions').length;
        const rejects = value.filter((v) => v.result === 'Reject').length;
        const parts = [];
        if (accepts) parts.push(`${accepts} Accept`);
        if (withActions) parts.push(`${withActions} w/Actions`);
        if (rejects) parts.push(`${rejects} Reject`);
        return parts.join(', ') || '—';
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon />}
          label="View Review"
          onClick={() => onView(params.row)}
        />,
      ],
    },
  ];
}
