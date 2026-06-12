import type { City } from '../../types';

export type CityProjectionSummary = {
  city: City;
  taxPercent: number;
  streamingBonusPercent: number;
  competitionPercent: number;
};
