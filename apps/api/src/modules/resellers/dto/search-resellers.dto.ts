import {
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ResellerStatus {
  ATIVA = 'ATIVA',
  INATIVA = 'INATIVA',
  EM_PROSPECCAO = 'EM_PROSPECCAO',
}

@ValidatorConstraint({ name: 'LocationCriteria', async: false })
export class LocationCriteriaValidator implements ValidatorConstraintInterface {
  validate(_value: any, args: ValidationArguments): boolean {
    const obj = args.object as SearchResellersDto;
    return !!(
      obj.zipCode ||
      obj.latitude ||
      obj.longitude ||
      obj.street ||
      obj.neighborhood
    );
  }

  defaultMessage(): string {
    return 'Informe ao menos um critério de busca: CEP, endereço ou coordenadas';
  }
}

export class SearchResellersDto {
  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  radiusKm?: number;

  @IsOptional()
  @IsIn(['ATIVA', 'INATIVA', 'EM_PROSPECCAO'])
  status?: ResellerStatus;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @Validate(LocationCriteriaValidator)
  _locationCriteria: any;
}
