import { GridActionsCellItem } from '@mui/x-data-grid-premium';
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
        const approves = value.filter((v) => v.result === 'Approve').length;
        const rejects = value.filter((v) => v.result === 'Reject').length;
        return `${approves}A / ${rejects}R`;
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
