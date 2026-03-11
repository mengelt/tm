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
