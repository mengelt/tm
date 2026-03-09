import {
  idColumn,
  subjectColumn,
  submitterColumn,
  submittedDateColumn,
  needByDateColumn,
} from './shared';

export default function getCanceledColumns() {
  return [
    idColumn,
    subjectColumn,
    submitterColumn,
    submittedDateColumn,
    needByDateColumn,
  ];
}
