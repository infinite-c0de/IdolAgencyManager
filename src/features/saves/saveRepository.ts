import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeSaveData } from './service';
import type { SaveData, SaveSlotSummary } from './types';

export const SLOT_COUNT = 3;

const slotKey = (slotId: number) => `idol_agency_slot_${slotId}`;

export async function readSaveSlot(slotId: number) {
  try {
    const raw = await AsyncStorage.getItem(slotKey(slotId));
    if (!raw) {
      return null;
    }

    return normalizeSaveData(JSON.parse(raw), slotId);
  } catch {
    return null;
  }
}

export async function writeSaveSlot(slotId: number, save: SaveData) {
  await AsyncStorage.setItem(slotKey(slotId), JSON.stringify(save));
}

export async function removeSaveSlot(slotId: number) {
  await AsyncStorage.removeItem(slotKey(slotId));
}

export async function clearAllSaveSlots() {
  await Promise.all(
    Array.from({ length: SLOT_COUNT }, (_, index) => AsyncStorage.removeItem(slotKey(index + 1))),
  );
}

export async function listSaveSlots() {
  const slots = await Promise.all(
    Array.from({ length: SLOT_COUNT }, async (_, index) => {
      const id = index + 1;
      const save = await readSaveSlot(id);
      return {
        id,
        label: `Slot ${id}`,
        hasSave: Boolean(save),
        agencyName: save?.agency.name,
        city: save?.agency.city,
        updatedAt: save?.updatedAt,
      };
    }),
  );

  return slots satisfies SaveSlotSummary[];
}
