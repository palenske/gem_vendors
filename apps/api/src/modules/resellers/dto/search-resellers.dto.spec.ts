import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SearchResellersDto, ResellerStatus } from './search-resellers.dto';

describe('SearchResellersDto', () => {
  it('should validate DTO with coordinates', async () => {
    const dto = plainToInstance(SearchResellersDto, {
      latitude: -25.4284,
      longitude: -49.2733,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate DTO with zipCode', async () => {
    const dto = plainToInstance(SearchResellersDto, {
      zipCode: '01310-100',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate DTO with address', async () => {
    const dto = plainToInstance(SearchResellersDto, {
      street: 'Avenida Paulista',
      neighborhood: 'Bela Vista',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation without location criteria', async () => {
    const dto = plainToInstance(SearchResellersDto, {
      status: ResellerStatus.ATIVA,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    
    const locationError = errors.find(
      (e) => e.property === '_locationCriteria'
    );
    expect(locationError).toBeDefined();
  });

  it('should transform string numbers to actual numbers', async () => {
    const dto = plainToInstance(SearchResellersDto, {
      latitude: '-25.4284',
      longitude: '-49.2733',
      radiusKm: '10',
      page: '1',
      limit: '20',
    });

    expect(typeof dto.latitude).toBe('number');
    expect(typeof dto.longitude).toBe('number');
    expect(typeof dto.radiusKm).toBe('number');
    expect(typeof dto.page).toBe('number');
    expect(typeof dto.limit).toBe('number');
  });

  it('should accept valid status values', async () => {
    const dto = plainToInstance(SearchResellersDto, {
      latitude: -25.4284,
      longitude: -49.2733,
      status: ResellerStatus.ATIVA,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate DTO with text query q', async () => {
    const dto = plainToInstance(SearchResellersDto, {
      latitude: -25.4284,
      longitude: -49.2733,
      q: 'Batel',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject invalid status values', async () => {
    const dto = plainToInstance(SearchResellersDto, {
      latitude: -25.4284,
      longitude: -49.2733,
      status: 'INVALID_STATUS',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
