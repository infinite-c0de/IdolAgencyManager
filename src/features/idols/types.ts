import type { Status } from '../../types';

export type IdolFilterStatus = 'All' | Status;

export const IDOL_STATUSES: IdolFilterStatus[] = [
  'All',
  'Active',
  'Trainee',
  'Resting',
  'Promoting',
  'Injured',
];
