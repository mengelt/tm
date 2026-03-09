import { GridActionsCellItem } from '@mui/x-data-grid';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import CancelIcon from '@mui/icons-material/Cancel';
import {
  idColumnPending,
  subjectColumn,
  urgentColumn,
  submitterColumn,
  needByDateColumn,
  scheduledDateColumn,
} from './shared';

export default function getScheduledColumns({ onStart, onReschedule, onCancel }) {
  return [
    idColumnPending,
    subjectColumn,
    urgentColumn,
    submitterColumn,
    needByDateColumn,
    scheduledDateColumn,
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          key="start"
          icon={<PlayArrowIcon />}
          label="Start Review"
          onClick={() => onStart(params.row)}
        />,
        <GridActionsCellItem
          key="reschedule"
          icon={<EventRepeatIcon />}
          label="Reschedule"
          onClick={() => onReschedule(params.row)}
        />,
        <GridActionsCellItem
          key="cancel"
          icon={<CancelIcon />}
          label="Cancel"
          onClick={() => onCancel(params.row)}
        />,
      ],
    },
  ];
}
