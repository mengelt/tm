import {
  idColumn,
  subjectColumn,
  urgentColumn,
  submitterColumn,
  submittedDateColumn,
  needByDateColumn,
} from './shared';

export default function getCustomerWorkColumns() {
  return [
    idColumn,
    subjectColumn,
    urgentColumn,
    submitterColumn,
    submittedDateColumn,
    needByDateColumn,
    {
      field: 'returnReason',
      headerName: 'Return Reason',
      width: 250,
      renderCell: (params) => (
        <span title={params.value}>{params.value || '—'}</span>
      ),
    },
  ];
}
