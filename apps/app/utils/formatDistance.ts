/**
 * Formata distância com precisão condicional.
 *
 * Para distâncias >= 1km: retorna 1 decimal (ex: "1.5 km")
 * Para distâncias < 1km: retorna 2 decimais (ex: "0.50 km")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm >= 1) {
    return `${distanceKm.toFixed(1)} km`;
  }
  return `${distanceKm.toFixed(2)} km`;
}
