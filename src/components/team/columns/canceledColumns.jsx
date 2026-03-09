import {
  idColumnPending,
  subjectColumn,
  submitterColumn,
  submittedDateColumn,
  needByDateColumn,
} from './shared';

export default function getCanceledColumns() {
  return [
    idColumnPending,
    subjectColumn,
    submitterColumn,
    submittedDateColumn,
    needByDateColumn,
  ];
}
