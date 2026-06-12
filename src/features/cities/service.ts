import type { City } from '../../types';
import type { CityProjectionSummary } from './types';

export function getCityTaxPercent(city: City) {
  return Math.round(city.taxRate * 100);
}

export function getCityStreamingBonusPercent(city: City) {
  return Math.round(city.domesticStreamingBonus * 100);
}

export function buildCityProjectionSummary(city: City): CityProjectionSummary {
  return {
    city,
    taxPercent: getCityTaxPercent(city),
    streamingBonusPercent: getCityStreamingBonusPercent(city),
    competitionPercent: city.competition,
  };
}
