import { Test, TestingModule } from '@nestjs/testing';
import { GeoService } from './geo.service';

describe('GeoService', () => {
  let service: GeoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeoService],
    }).compile();

    service = module.get<GeoService>(GeoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('haversineKm', () => {
    it('should return 0 for the same point', () => {
      const point = { latitude: -25.4284, longitude: -49.2733 };
      const distance = service.haversineKm(point, point);
      expect(distance).toBe(0);
    });

    it('should calculate distance between two points in Curitiba (~2km)', () => {
      // Two points in Curitiba approximately 2km apart
      const pointA = { latitude: -25.4284, longitude: -49.2733 }; // Centro
      const pointB = { latitude: -25.4408, longitude: -49.2733 }; // ~1.4km south

      const distance = service.haversineKm(pointA, pointB);

      // Should be approximately 1.4km (within 1% margin)
      expect(distance).toBeGreaterThan(1.3);
      expect(distance).toBeLessThan(1.5);
    });

    it('should calculate distance between Curitiba and São Paulo (~340km)', () => {
      const curitiba = { latitude: -25.4284, longitude: -49.2733 };
      const saoPaulo = { latitude: -23.5505, longitude: -46.6333 };

      const distance = service.haversineKm(curitiba, saoPaulo);

      // Should be approximately 340km (within 5% margin)
      expect(distance).toBeGreaterThan(320);
      expect(distance).toBeLessThan(360);
    });

    it('should handle points across the equator', () => {
      const north = { latitude: 10.0, longitude: 0.0 };
      const south = { latitude: -10.0, longitude: 0.0 };

      const distance = service.haversineKm(north, south);

      // Should be approximately 2222km
      expect(distance).toBeGreaterThan(2200);
      expect(distance).toBeLessThan(2250);
    });
  });
});
