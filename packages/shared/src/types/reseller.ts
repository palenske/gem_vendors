export enum ResellerStatus {
  ATIVA = "ATIVA",
  INATIVA = "INATIVA",
  EM_PROSPECCAO = "EM_PROSPECCAO",
}

export interface Reseller {
  id: number;
  name: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  status: ResellerStatus;
  latitude: number | null;
  longitude: number | null;
}

export interface SearchResult {
  origin: {
    latitude: number;
    longitude: number;
    resolvedFrom: string;
  };
  results: ResellerResult[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ResellerResult {
  id: number;
  name: string;
  address: string;
  zipCode: string;
  status: ResellerStatus;
  distanceKm: number;
  location: {
    latitude: number;
    longitude: number;
  };
  routeUrl: string;
}

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface SearchParams {
  zipCode?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  q?: string;
  status?: ResellerStatus;
  page?: number;
  limit?: number;
}
