import type { City } from '../../types';

function getFallbackCity(cities: City[]): City {
  const fallback = cities[0];
  if (!fallback) {
    throw new Error('No cities configured');
  }
  return fallback;
}

export function getCityById(cities: City[], cityId: string): City {
  const fallback = getFallbackCity(cities);
  return cities.find(city => city.id === cityId) ?? fallback;
}

export function getCityByName(cities: City[], cityName: string): City {
  const fallback = getFallbackCity(cities);
  return cities.find(city => city.name === cityName) ?? fallback;
}
