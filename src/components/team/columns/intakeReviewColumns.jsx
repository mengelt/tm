import { GridActionsCellItem } from '@mui/x-data-grid-premium';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import EventIcon from '@mui/icons-material/Event';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  idColumn,
  subjectColumn,
  urgentColumn,
  submitterColumn,
  submittedDateColumn,
  needByDateColumn,
} from './shared';

export default function getIntakeReviewColumns({ onReturn, onSchedule, onCancel }) {
  return [
    idColumn,
    subjectColumn,
    urgentColumn,
    submitterColumn,
    submittedDateColumn,
    needByDateColumn,
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          key="return"
          icon={<AssignmentReturnIcon />}
          label="Return to Customer"
          onClick={() => onReturn(params.row)}
        />,
        <GridActionsCellItem
          key="schedule"
          icon={<EventIcon />}
          label="Schedule Review"
          onClick={() => onSchedule(params.row)}
        />,
        <GridActionsCellItem
          key="cancel"
          icon={<CancelIcon />}
          label="Cancel Review"
          onClick={() => onCancel(params.row)}
        />,
      ],
    },
  ];
}
