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
import type {
  CreateAgencyPayload,
  RecruitResult,
  RefreshScoutingResult,
  UseAgencyActionsParams,
} from '../features/agency';
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
  const SCOUTING_REFRESH_COST = 12_000_000;
  const VISIBLE_CANDIDATE_COUNT = 10;

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

  const refreshScoutingCandidates = (activeFilter: string): RefreshScoutingResult => {
    if (trainees.length === 0) {
      return { ok: false, reason: 'NO_CANDIDATES' };
    }

    if (agency.money < SCOUTING_REFRESH_COST) {
      return { ok: false, reason: 'INSUFFICIENT_FUNDS' };
    }

    let refreshedVisibleCount = 0;
    let refreshedFilterMatches = 0;

    setTrainees(current => {
      if (current.length === 0) {
        return current;
      }

      const targetCount = Math.min(VISIBLE_CANDIDATE_COUNT, current.length);
      const currentVisibleIndexes = current
        .map((trainee, index) => ({ trainee, index }))
        .filter(({ trainee }) => trainee.isScoutingVisible !== false)
        .map(({ index }) => index);
      const hiddenIndexes = current
        .map((trainee, index) => ({ trainee, index }))
        .filter(({ trainee }) => trainee.isScoutingVisible === false)
        .map(({ index }) => index);
      const reset = current.map(trainee => ({ ...trainee, isScoutingVisible: false }));
      const shuffledHidden = [...hiddenIndexes].sort(() => Math.random() - 0.5);
      const shuffledAll = reset.map((_, index) => index).sort(() => Math.random() - 0.5);
      const preferredIndexes =
        activeFilter === 'All'
          ? []
          : shuffledHidden.filter(index => reset[index].skill === activeFilter);

      const selected = new Set<number>();
      if (preferredIndexes.length > 0) {
        selected.add(preferredIndexes[0]);
      }

      for (const index of shuffledHidden) {
        if (selected.size >= targetCount) {
          break;
        }
        selected.add(index);
      }

      // If hidden pool is exhausted, fill remaining slots from all candidates.
      for (const index of shuffledAll) {
        if (selected.size >= targetCount) {
          break;
        }
        selected.add(index);
      }

      for (const index of selected) {
        reset[index] = { ...reset[index], isScoutingVisible: true };
      }

      refreshedVisibleCount = selected.size;
      refreshedFilterMatches =
        activeFilter === 'All'
          ? selected.size
          : [...selected].filter(index => reset[index].skill === activeFilter).length;

      // Hard anti-stall: ensure refresh doesn't return identical set when alternatives exist.
      const unchangedCount = [...selected].filter(index => currentVisibleIndexes.includes(index)).length;
      if (selected.size === targetCount && unchangedCount === targetCount && hiddenIndexes.length > 0) {
        const replacementPool = shuffledHidden.filter(index => !selected.has(index));
        if (replacementPool.length > 0) {
          const toReplace = [...selected][selected.size - 1];
          selected.delete(toReplace);
          selected.add(replacementPool[0]);
          for (const index of reset.map((_, idx) => idx)) {
            reset[index] = { ...reset[index], isScoutingVisible: selected.has(index) };
          }
          refreshedFilterMatches =
            activeFilter === 'All'
              ? selected.size
              : [...selected].filter(index => reset[index].skill === activeFilter).length;
        }
      }

      return reset;
    });

    setAgency(current => ({ ...current, money: Math.max(0, current.money - SCOUTING_REFRESH_COST) }));

    return {
      ok: true,
      cost: SCOUTING_REFRESH_COST,
      visibleCount: refreshedVisibleCount,
      filterMatches: refreshedFilterMatches,
    };
  };

  return { createAgency, recruitTrainee, refreshScoutingCandidates };
}
