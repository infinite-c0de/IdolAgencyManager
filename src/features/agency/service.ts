import type { Agency, City, Idol, Trainee } from '../../types';
import type { CreateAgencyPayload } from './types';
import { getProjectedMonthlyIncome, getStartingReputation } from '../economy/service';

export function normalizeAgencyInputs(payload: CreateAgencyPayload) {
  return {
    agencyName: payload.agencyName.trim(),
    ceoName: payload.ceoName.trim(),
    cityId: payload.cityId,
  };
}

export function isValidAgencyCreationInput(payload: CreateAgencyPayload) {
  const normalized = normalizeAgencyInputs(payload);
  return Boolean(normalized.agencyName && normalized.ceoName);
}

export function buildCreatedAgency(
  initialAgency: Agency,
  payload: CreateAgencyPayload,
  city: City,
): Agency {
  const normalized = normalizeAgencyInputs(payload);
  return {
    ...initialAgency,
    name: normalized.agencyName.toUpperCase(),
    ceoName: normalized.ceoName,
    city: city.name,
    money: city.startingBudget,
    reputation: getStartingReputation(city),
    monthlyIncome: getProjectedMonthlyIncome(city),
  };
}

export function canRecruitTrainee(agency: Agency, trainee: Trainee) {
  return agency.money >= trainee.cost;
}

export function spendRecruitCost(agency: Agency, trainee: Trainee): Agency {
  return {
    ...agency,
    money: agency.money - trainee.cost,
  };
}

export function sortIdolsNewestFirst(nextIdol: Idol, currentIdols: Idol[]) {
  return [nextIdol, ...currentIdols];
}
