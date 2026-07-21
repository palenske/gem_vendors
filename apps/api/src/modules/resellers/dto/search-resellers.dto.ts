import { IsString, IsNumber, IsOptional, IsIn } from "class-validator";
import { Type } from "class-transformer";
import { ResellerStatus } from "@prisma/client";

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
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(Object.values(ResellerStatus))
  status?: ResellerStatus;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}
