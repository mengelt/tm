import { GridActionsCellItem } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  idColumnPending,
  subjectColumn,
  urgentColumn,
  submitterColumn,
  submittedDateColumn,
  needByDateColumn,
} from './shared';

export default function getIntakeReviewColumns({ onViewDetails }) {
  return [
    idColumnPending,
    subjectColumn,
    urgentColumn,
    submitterColumn,
    submittedDateColumn,
    needByDateColumn,
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={<VisibilityIcon />}
          label="View Details"
          onClick={() => onViewDetails(params.row)}
        />,
      ],
    },
  ];
}
