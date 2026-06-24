import { useRef } from 'react';
import { BASE_REFRESH_COST, MAX_ROSTER_SIZE, cities } from '../data/gameData';
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
  ScoutingFilters,
  SpendAgencyMoneyResult,
  UseAgencyActionsParams,
} from '../features/agency';
import { getCityById } from '../features/cities';
import { traineeToIdol } from '../features/idols';
import { cloneInitialAgency } from './gameStateHelpers';

export function useAgencyActions({
  agency,
  idols,
  trainees,
  currentWeek,
  setAgency,
  setIdols,
  setTrainees,
  setIsAgencyCreated,
}: UseAgencyActionsParams) {
  const VISIBLE_CANDIDATE_COUNT = 10;
  const recentlyShownTraineeIdsRef = useRef<string[]>([]);

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

    if (idols.length >= MAX_ROSTER_SIZE) {
      return { ok: false, reason: 'ROSTER_FULL' };
    }

    if (!canRecruitTrainee(agency, trainee)) {
      return { ok: false, reason: 'INSUFFICIENT_FUNDS' };
    }

    const created = traineeToIdol(trainee, currentWeek);
    setIdols(current => sortIdolsNewestFirst(created, current));
    setTrainees(current =>
      current.filter(
        t =>
          t.id !== traineeId &&
          t.name.toLowerCase() !== trainee.name.toLowerCase() &&
          (t.fullName ?? '').toLowerCase() !== (trainee.fullName ?? '').toLowerCase() &&
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

  const refreshScoutingCandidates = (filters: ScoutingFilters, overrideCost?: number): RefreshScoutingResult => {
    const cost = overrideCost ?? BASE_REFRESH_COST;
    if (trainees.length === 0) {
      return { ok: false, reason: 'NO_CANDIDATES' };
    }

    if (agency.money < cost) {
      return { ok: false, reason: 'INSUFFICIENT_FUNDS' };
    }

    let refreshedVisibleCount = 0;
    let refreshedFilterMatches = 0;

    setTrainees(current => {
      if (current.length === 0) return current;

      const targetCount = Math.min(VISIBLE_CANDIDATE_COUNT, current.length);
      const matchesFilter = (trainee: (typeof current)[number]) => {
        if (filters.skill !== 'All' && trainee.skill !== filters.skill) return false;
        if (filters.gender !== 'All' && trainee.gender !== filters.gender) return false;
        if (filters.nationality !== 'All' && trainee.nationality !== filters.nationality) return false;
        return true;
      };
      const sortByShownCount = (
        a: { trainee: (typeof current)[number]; index: number },
        b: { trainee: (typeof current)[number]; index: number },
      ) => {
        const diff = (a.trainee.shownCount ?? 0) - (b.trainee.shownCount ?? 0);
        return diff !== 0 ? diff : Math.random() - 0.5;
      };

      const hidden = current
        .map((trainee, index) => ({ trainee, index }))
        .filter(({ trainee }) => !trainee.isScoutingVisible);

      // Prioritize full-filter matches from the whole hidden pool first.
      const prioritized = [
        ...hidden.filter(({ trainee }) => matchesFilter(trainee)).sort(sortByShownCount),
        ...hidden.filter(({ trainee }) => !matchesFilter(trainee)).sort(sortByShownCount),
      ];

      const selected = new Set(prioritized.slice(0, targetCount).map(({ index }) => index));

      const next = current.map((trainee, index) => {
        if (selected.has(index)) {
          return {
            ...trainee,
            isScoutingVisible: true,
            shownCount: (trainee.shownCount ?? 0) + 1,
          };
        }
        return { ...trainee, isScoutingVisible: false };
      });

      refreshedVisibleCount = selected.size;
      refreshedFilterMatches = [...selected].filter(index => matchesFilter(next[index])).length;

      recentlyShownTraineeIdsRef.current = [];
      return next;
    });

    setAgency(current => ({ ...current, money: Math.max(0, current.money - cost) }));

    return {
      ok: true,
      cost,
      visibleCount: refreshedVisibleCount,
      filterMatches: refreshedFilterMatches,
    };
  };

  const spendAgencyMoney = (cost: number): SpendAgencyMoneyResult => {
    if (cost <= 0) {
      return { ok: true, cost: 0 };
    }
    if (agency.money < cost) {
      return { ok: false, reason: 'INSUFFICIENT_FUNDS' };
    }
    setAgency(current => ({ ...current, money: Math.max(0, current.money - cost) }));
    return { ok: true, cost };
  };

  return { createAgency, recruitTrainee, refreshScoutingCandidates, spendAgencyMoney };
}
