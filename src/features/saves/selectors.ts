import { SLOT_COUNT } from './saveRepository';
import type { SaveSlotSummary } from './types';

export function buildEmptySaveSlots(): SaveSlotSummary[] {
  return Array.from({ length: SLOT_COUNT }, (_, index) => ({
    id: index + 1,
    label: `Slot ${index + 1}`,
    hasSave: false,
  }));
}
