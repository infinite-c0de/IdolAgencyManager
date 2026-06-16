import { useEffect, useRef, useState } from 'react';
import {
  buildEmptySaveSlots,
  clearAllSaveSlots,
  listSaveSlots,
  normalizeLoadedSlotSave,
  readSaveSlot,
  removeSaveSlot,
  writeSaveSlot,
} from '../features/saves';
import { normalizeIdolIdentity, normalizePersonalityProfile, normalizeTraineeIdentity } from '../features/idols';
import type { SaveData, SaveSlotSummary, UseSaveLifecycleParams } from '../features/saves';
import {
  cloneInitialAgency,
  cloneInitialTrainees,
  createInitialSave,
  unlockWeeklyScoutingCandidates,
  withCurrentTraineeAssets,
} from './gameStateHelpers';

export function useSaveLifecycle({
  agency,
  idols,
  trainees,
  groups,
  isAgencyCreated,
  activeSlotId,
  scoutingLastGrowthAt,
  setAgency,
  setIdols,
  setTrainees,
  setGroups,
  setIsAgencyCreated,
  setActiveSlotId,
  setScoutingLastGrowthAt,
}: UseSaveLifecycleParams) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [saveSlots, setSaveSlots] = useState<SaveSlotSummary[]>(() => buildEmptySaveSlots());
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshSaveSlots = async () => {
    setSaveSlots(await listSaveSlots());
  };

  const applySave = (save: SaveData) => {
    setAgency({ ...save.agency });
    setIdols(
      save.idols.map(idol => {
        const normalized = normalizeIdolIdentity(idol);
        return {
          ...normalized,
          languages: [...idol.languages],
          gradient: [...idol.gradient],
          stats: { ...idol.stats },
          personalityProfile: normalizePersonalityProfile(idol.personalityProfile, idol.personality),
        };
      }),
    );
    setTrainees(
      withCurrentTraineeAssets(save.trainees).map(trainee => {
        const normalized = normalizeTraineeIdentity(trainee);
        return {
          ...normalized,
          languages: [...trainee.languages],
          gradient: [...trainee.gradient],
          personalityProfile: normalizePersonalityProfile(
            trainee.personalityProfile,
            trainee.personality,
          ),
        };
      }),
    );
    setGroups(
      save.groups.map(group => ({
        ...group,
        memberIds: [...group.memberIds],
        roleAssignments: group.roleAssignments ? { ...group.roleAssignments } : undefined,
        gradient: [...group.gradient],
      })),
    );
    setIsAgencyCreated(Boolean(save.isAgencyCreated));
    setActiveSlotId(save.activeSlotId);
    setScoutingLastGrowthAt(save.scoutingLastGrowthAt);
  };

  useEffect(() => {
    let active = true;

    const hydrate = async () => {
      if (active) {
        await refreshSaveSlots();
        setIsHydrated(true);
      }
    };

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    setTrainees(current => withCurrentTraineeAssets(current));
  }, [isHydrated, setTrainees]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const lastMs = Date.parse(scoutingLastGrowthAt);
    if (!Number.isFinite(lastMs)) {
      setScoutingLastGrowthAt(new Date().toISOString());
      return;
    }

    const nowMs = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const elapsedWeeks = Math.floor((nowMs - lastMs) / weekMs);
    if (elapsedWeeks <= 0) {
      return;
    }

    setTrainees(current => unlockWeeklyScoutingCandidates(current, elapsedWeeks));
    setScoutingLastGrowthAt(new Date(lastMs + elapsedWeeks * weekMs).toISOString());
  }, [isHydrated, scoutingLastGrowthAt, setScoutingLastGrowthAt, setTrainees]);

  useEffect(() => {
    const slotId = activeSlotId;
    if (!isHydrated || slotId === null) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const payload: SaveData = {
        agency,
        idols,
        trainees,
        groups,
        isAgencyCreated,
        activeSlotId: slotId,
        scoutingLastGrowthAt,
        updatedAt: new Date().toISOString(),
      };
      writeSaveSlot(slotId, payload).then(refreshSaveSlots).catch(() => {
        // Ignore save errors for now; app remains playable.
      });
    }, 300);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [agency, idols, trainees, groups, isAgencyCreated, isHydrated, activeSlotId, scoutingLastGrowthAt]);

  const resetGame = async () => {
    setAgency(cloneInitialAgency());
    setIdols([]);
    setTrainees(cloneInitialTrainees());
    setGroups([]);
    setIsAgencyCreated(false);
    setActiveSlotId(null);
    setScoutingLastGrowthAt(new Date().toISOString());
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await clearAllSaveSlots();
    await refreshSaveSlots();
  };

  const startNewGameInSlot = async (slotId: number) => {
    const save = createInitialSave(slotId);
    applySave(save);
    await writeSaveSlot(slotId, save);
    await refreshSaveSlots();
  };

  const loadGameFromSlot = async (slotId: number) => {
    const save = await readSaveSlot(slotId);
    if (!save) {
      return false;
    }

    const { normalizedSave, destination } = normalizeLoadedSlotSave(save);

    applySave(normalizedSave);
    if (normalizedSave !== save) {
      await writeSaveSlot(slotId, normalizedSave);
    }
    await refreshSaveSlots();
    return destination;
  };

  const deleteSaveSlot = async (slotId: number) => {
    await removeSaveSlot(slotId);

    if (activeSlotId === slotId) {
      setAgency(cloneInitialAgency());
      setIdols([]);
      setTrainees(cloneInitialTrainees());
      setGroups([]);
      setIsAgencyCreated(false);
      setActiveSlotId(null);
      setScoutingLastGrowthAt(new Date().toISOString());
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    }

    await refreshSaveSlots();
  };

  return {
    isHydrated,
    saveSlots,
    startNewGameInSlot,
    loadGameFromSlot,
    deleteSaveSlot,
    resetGame,
  };
}
