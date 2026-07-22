import { IsString } from "class-validator";

export class ReverseGeocodeResponseDto {
  @IsString()
  logradouro: string;

  @IsString()
  bairro: string;

  @IsString()
  localidade: string;

  @IsString()
  uf: string;

  @IsString()
  cep: string;
}
