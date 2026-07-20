import { IsString, IsNumber, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ResellerStatus } from './search-resellers.dto';

export class OriginDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  resolvedFrom: string;
}

export class LocationDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class ResellerResultDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  zipCode: string;

  @IsIn(['ATIVA', 'INATIVA', 'EM_PROSPECCAO'])
  status: ResellerStatus;

  @IsNumber()
  distanceKm: number;

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsString()
  routeUrl: string;
}

export class MetaDto {
  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;

  @IsNumber()
  total: number;
}

export class SearchResponseDto {
  @ValidateNested()
  @Type(() => OriginDto)
  origin: OriginDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ResellerResultDto)
  results: ResellerResultDto[];

  @ValidateNested()
  @Type(() => MetaDto)
  meta: MetaDto;
}
