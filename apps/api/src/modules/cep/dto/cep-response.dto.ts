import { IsString } from 'class-validator';

export class CepResponseDto {
  @IsString()
  cep: string;

  @IsString()
  logradouro: string;

  @IsString()
  bairro: string;

  @IsString()
  localidade: string;

  @IsString()
  uf: string;
}
