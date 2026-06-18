import { useRef } from 'react';
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
  const MAX_ROSTER_SIZE = 30;
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

    const created = traineeToIdol(trainee);
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

  const refreshScoutingCandidates = (activeFilter: string, overrideCost?: number): RefreshScoutingResult => {
    const cost = overrideCost ?? SCOUTING_REFRESH_COST;
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

      // Sort by shownCount ascending — least shown first, shuffle within same count for variety
      const sorted = current
        .map((trainee, index) => ({ trainee, index }))
        .filter(({ index }) => !current[index].isScoutingVisible)
        .sort((a, b) => {
          const diff = (a.trainee.shownCount ?? 0) - (b.trainee.shownCount ?? 0);
          return diff !== 0 ? diff : Math.random() - 0.5;
        });

      const selected = new Set(sorted.slice(0, targetCount).map(({ index }) => index));

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
      refreshedFilterMatches =
        activeFilter === 'All'
          ? selected.size
          : [...selected].filter(index => next[index].skill === activeFilter).length;

      recentlyShownTraineeIdsRef.current = [];
      return next;
    });

    setAgency(current => ({ ...current, money: Math.max(0, current.money - cost) }));

    return {
      ok: true,
      cost: SCOUTING_REFRESH_COST,
      visibleCount: refreshedVisibleCount,
      filterMatches: refreshedFilterMatches,
    };
  };

  return { createAgency, recruitTrainee, refreshScoutingCandidates };
}
