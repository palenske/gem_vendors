import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CepResponseDto } from './dto/cep-response.dto';

@Injectable()
export class CepService {
  private readonly logger = new Logger(CepService.name);
  private readonly viacepUrl = 'https://viacep.com.br/ws';

  async findByZipCode(zipCode: string): Promise<CepResponseDto> {
    // Strip non-digits from CEP
    const digitsOnly = zipCode.replace(/\D/g, '');

    if (digitsOnly.length !== 8) {
      throw new NotFoundException('CEP inválido');
    }

    try {
      const response = await fetch(`${this.viacepUrl}/${digitsOnly}/json`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        this.logger.error(`ViaCEP HTTP error: ${response.status}`);
        throw new Error('ViaCEP request failed');
      }

      const data = (await response.json()) as Record<string, string>;

      if (data.erro) {
        throw new NotFoundException('CEP não encontrado');
      }

      return {
        cep: data.cep,
        logradouro: data.logradouro,
        bairro: data.bairro,
        localidade: data.localidade,
        uf: data.uf,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`ViaCEP error: ${error}`);
      throw new Error('Serviço de CEP temporariamente indisponível');
    }
  }
}
