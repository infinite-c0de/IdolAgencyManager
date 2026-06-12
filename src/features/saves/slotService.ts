import { initialAgency } from '../../data/gameData';
import type { SaveData } from './types';

export function hasAgencyProgress(save: SaveData) {
  return (
    save.isAgencyCreated ||
    save.agency.name !== initialAgency.name ||
    save.agency.ceoName !== initialAgency.ceoName ||
    save.agency.city !== initialAgency.city ||
    save.agency.money !== initialAgency.money
  );
}

export function normalizeLoadedSlotSave(save: SaveData) {
  const created = hasAgencyProgress(save);
  const normalizedSave = created && !save.isAgencyCreated ? { ...save, isAgencyCreated: true } : save;

  return {
    created,
    normalizedSave,
    destination: created ? ('AgencyDashboard' as const) : ('Onboarding' as const),
  };
}
