import { ResellerStatus } from "@prisma/client";

export interface OriginDto {
  latitude: number;
  longitude: number;
  resolvedFrom: string;
}

export interface LocationDto {
  latitude: number;
  longitude: number;
}

export interface ResellerResultDto {
  id: number;
  name: string;
  address: string;
  zipCode: string;
  status: ResellerStatus;
  distanceKm: number;
  location: LocationDto;
  routeUrl: string;
}

export interface MetaDto {
  page: number;
  limit: number;
  total: number;
}

export interface SearchResponseDto {
  origin: OriginDto;
  results: ResellerResultDto[];
  meta: MetaDto;
}
