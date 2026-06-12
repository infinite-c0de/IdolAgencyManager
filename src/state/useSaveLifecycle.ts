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
import type { SaveData, SaveSlotSummary, UseSaveLifecycleParams } from '../features/saves';
import {
  cloneInitialAgency,
  cloneInitialIdols,
  cloneInitialTrainees,
  createInitialSave,
  withCurrentTraineeAssets,
} from './gameStateHelpers';

export function useSaveLifecycle({
  agency,
  idols,
  trainees,
  isAgencyCreated,
  activeSlotId,
  setAgency,
  setIdols,
  setTrainees,
  setIsAgencyCreated,
  setActiveSlotId,
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
      save.idols.map(idol => ({
        ...idol,
        languages: [...idol.languages],
        gradient: [...idol.gradient],
        stats: { ...idol.stats },
      })),
    );
    setTrainees(
      withCurrentTraineeAssets(save.trainees).map(trainee => ({
        ...trainee,
        languages: [...trainee.languages],
        gradient: [...trainee.gradient],
      })),
    );
    setIsAgencyCreated(Boolean(save.isAgencyCreated));
    setActiveSlotId(save.activeSlotId);
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
        isAgencyCreated,
        activeSlotId: slotId,
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
  }, [agency, idols, trainees, isAgencyCreated, isHydrated, activeSlotId]);

  const resetGame = async () => {
    setAgency(cloneInitialAgency());
    setIdols(cloneInitialIdols());
    setTrainees(cloneInitialTrainees());
    setIsAgencyCreated(false);
    setActiveSlotId(null);
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
      setIdols(cloneInitialIdols());
      setTrainees(cloneInitialTrainees());
      setIsAgencyCreated(false);
      setActiveSlotId(null);
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
