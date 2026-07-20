import { Test, TestingModule } from '@nestjs/testing';
import { CepService } from './cep.service';
import { NotFoundException } from '@nestjs/common';

describe('CepService', () => {
  let service: CepService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CepService],
    }).compile();

    service = module.get<CepService>(CepService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByZipCode', () => {
    it('should return address for valid CEP', async () => {
      // This test calls the real ViaCEP API
      // In a real test suite, you would mock the HTTP client
      const result = await service.findByZipCode('01310-100');

      expect(result).toBeDefined();
      expect(result.cep).toBe('01310-100');
      expect(result.logradouro).toBe('Avenida Paulista');
      expect(result.bairro).toBe('Bela Vista');
      expect(result.localidade).toBe('São Paulo');
      expect(result.uf).toBe('SP');
    });

    it('should throw NotFoundException for invalid CEP format', async () => {
      await expect(service.findByZipCode('123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for non-existent CEP', async () => {
      await expect(service.findByZipCode('00000-000')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
