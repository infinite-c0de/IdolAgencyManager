import { cities } from '../data/gameData';
import {
  buildCreatedAgency,
  canRecruitTrainee,
  findTraineeById,
  hasIdolWithStageName,
  isValidAgencyCreationInput,
  sortIdolsNewestFirst,
  spendRecruitCost,
} from '../features/agency';
import type { CreateAgencyPayload, RecruitResult, UseAgencyActionsParams } from '../features/agency';
import { getCityById } from '../features/cities';
import { traineeToIdol } from '../features/idols';
import { cloneInitialAgency } from './gameStateHelpers';

export function useAgencyActions({
  agency,
  idols,
  trainees,
  setAgency,
  setIdols,
  setTrainees,
  setIsAgencyCreated,
}: UseAgencyActionsParams) {
  const createAgency = ({ agencyName, ceoName, cityId, logo }: CreateAgencyPayload) => {
    const pickedCity = getCityById(cities, cityId);
    if (!isValidAgencyCreationInput({ agencyName, ceoName, cityId, logo })) {
      return false;
    }

    setAgency(() =>
      buildCreatedAgency(cloneInitialAgency(), { agencyName, ceoName, cityId, logo }, pickedCity),
    );
    setIsAgencyCreated(true);
    return true;
  };

  const recruitTrainee = (traineeId: string): RecruitResult => {
    const trainee = findTraineeById(trainees, traineeId);
    if (!trainee) {
      return { ok: false, reason: 'NOT_FOUND' };
    }

    const alreadyExists =
      hasIdolWithStageName(idols, trainee.name) ||
      idols.some(
        idol =>
          trainee.artKey !== undefined &&
          idol.artKey !== undefined &&
          String(idol.artKey) === String(trainee.artKey),
      );
    if (alreadyExists) {
      return { ok: false, reason: 'ALREADY_RECRUITED' };
    }

    if (!canRecruitTrainee(agency, trainee)) {
      return { ok: false, reason: 'INSUFFICIENT_FUNDS' };
    }

    const created = traineeToIdol(trainee);
    setIdols(current => sortIdolsNewestFirst(created, current));
    setTrainees(current =>
      current.filter(
        t =>
          t.id !== traineeId &&
          !(
            trainee.artKey !== undefined &&
            t.artKey !== undefined &&
            String(t.artKey) === String(trainee.artKey)
          ),
      ),
    );
    setAgency(current => spendRecruitCost(current, trainee));
    return { ok: true, idolName: trainee.name };
  };

  return { createAgency, recruitTrainee };
}
