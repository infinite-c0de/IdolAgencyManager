import type { Idol } from '../../types';
import type { IdolFilterStatus } from './types';

export function filterIdols(idols: Idol[], query: string, status: IdolFilterStatus) {
  const normalizedQuery = query.trim().toLowerCase();

  return idols.filter(
    idol =>
      (status === 'All' || idol.status === status) &&
      (normalizedQuery === '' ||
        idol.stageName.toLowerCase().includes(normalizedQuery) ||
        idol.role.toLowerCase().includes(normalizedQuery) ||
        idol.status.toLowerCase().includes(normalizedQuery) ||
        (idol.group ?? '').toLowerCase().includes(normalizedQuery)),
  );
}
