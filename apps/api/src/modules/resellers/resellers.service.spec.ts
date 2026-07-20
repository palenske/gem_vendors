import { Test, TestingModule } from '@nestjs/testing';
import { ResellersService } from './resellers.service';
import { PrismaService } from '../../prisma/prisma.service';
import { GeoService } from '../geo/geo.service';
import { GeocodingService } from '../geo/geocoding.service';
import { CepService } from '../cep/cep.service';
import { SearchResellersDto, ResellerStatus } from './dto/search-resellers.dto';

describe('ResellersService', () => {
  let service: ResellersService;

  const mockPrismaService = {
    reseller: {
      findMany: jest.fn(),
    },
  };

  const mockGeoService = {
    haversineKm: jest.fn(),
  };

  const mockGeocodingService = {
    geocode: jest.fn(),
  };

  const mockCepService = {
    findByZipCode: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResellersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: GeoService, useValue: mockGeoService },
        { provide: GeocodingService, useValue: mockGeocodingService },
        { provide: CepService, useValue: mockCepService },
      ],
    }).compile();

    service = module.get<ResellersService>(ResellersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    const mockResellers = [
      {
        id: '1',
        name: 'Revendedora A',
        street: 'Rua A',
        number: '100',
        neighborhood: 'Centro',
        city: 'Curitiba',
        state: 'PR',
        zipCode: '80010-000',
        status: 'ATIVA',
        latitude: -25.4284,
        longitude: -49.2733,
      },
      {
        id: '2',
        name: 'Revendedora B',
        street: 'Rua B',
        number: '200',
        neighborhood: 'Batel',
        city: 'Curitiba',
        state: 'PR',
        zipCode: '80240-000',
        status: 'ATIVA',
        latitude: -25.4408,
        longitude: -49.2733,
      },
    ];

    it('should search by coordinates and return results sorted by distance', async () => {
      mockPrismaService.reseller.findMany.mockResolvedValue(mockResellers);
      mockGeoService.haversineKm
        .mockReturnValueOnce(1.5)
        .mockReturnValueOnce(2.8);

      const dto: SearchResellersDto = {
        latitude: -25.4284,
        longitude: -49.2733,
      };

      const result = await service.search(dto);

      expect(result.origin).toEqual({
        latitude: -25.4284,
        longitude: -49.2733,
        resolvedFrom: 'coordinates',
      });
      expect(result.results).toHaveLength(2);
      expect(result.results[0].distanceKm).toBe(1.5);
      expect(result.results[1].distanceKm).toBe(2.8);
      expect(result.meta.total).toBe(2);
    });

    it('should search by zipCode', async () => {
      mockCepService.findByZipCode.mockResolvedValue({
        logradouro: 'Avenida Paulista',
        bairro: 'Bela Vista',
        localidade: 'São Paulo',
        uf: 'SP',
      });
      mockGeocodingService.geocode.mockResolvedValue({
        latitude: -23.5505,
        longitude: -46.6333,
      });
      mockPrismaService.reseller.findMany.mockResolvedValue([]);
      mockGeoService.haversineKm.mockReturnValue(0);

      const dto: SearchResellersDto = {
        zipCode: '01310-100',
      };

      const result = await service.search(dto);

      expect(result.origin).toEqual({
        latitude: -23.5505,
        longitude: -46.6333,
        resolvedFrom: 'zipCode',
      });
      expect(mockCepService.findByZipCode).toHaveBeenCalledWith('01310-100');
      expect(mockGeocodingService.geocode).toHaveBeenCalled();
    });

    it('should filter by radiusKm', async () => {
      mockPrismaService.reseller.findMany.mockResolvedValue(mockResellers);
      mockGeoService.haversineKm
        .mockReturnValueOnce(5)
        .mockReturnValueOnce(15);

      const dto: SearchResellersDto = {
        latitude: -25.4284,
        longitude: -49.2733,
        radiusKm: 10,
      };

      const result = await service.search(dto);

      expect(result.results).toHaveLength(1);
      expect(result.results[0].distanceKm).toBe(5);
    });

    it('should filter by status', async () => {
      mockPrismaService.reseller.findMany.mockResolvedValue(mockResellers);
      mockGeoService.haversineKm.mockReturnValue(1);

      const dto: SearchResellersDto = {
        latitude: -25.4284,
        longitude: -49.2733,
        status: ResellerStatus.INATIVA,
      };

      await service.search(dto);

      expect(mockPrismaService.reseller.findMany).toHaveBeenCalledWith({
        where: {
          status: 'INATIVA',
          latitude: { not: null },
          longitude: { not: null },
        },
      });
    });

    it('should paginate results', async () => {
      const manyResellers = Array.from({ length: 25 }, (_, i) => ({
        ...mockResellers[0],
        id: String(i + 1),
        name: `Revendedora ${i + 1}`,
      }));
      mockPrismaService.reseller.findMany.mockResolvedValue(manyResellers);
      mockGeoService.haversineKm.mockReturnValue(1);

      const dto: SearchResellersDto = {
        latitude: -25.4284,
        longitude: -49.2733,
        page: 2,
        limit: 10,
      };

      const result = await service.search(dto);

      expect(result.results).toHaveLength(10);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.total).toBe(25);
    });

    it('should exclude resellers without coordinates via DB filter', async () => {
      mockPrismaService.reseller.findMany.mockResolvedValue([mockResellers[0]]);
      mockGeoService.haversineKm.mockReturnValue(1);

      const dto: SearchResellersDto = {
        latitude: -25.4284,
        longitude: -49.2733,
      };

      const result = await service.search(dto);

      expect(result.results).toHaveLength(1);
      expect(result.results[0].id).toBe('1');
      expect(mockPrismaService.reseller.findMany).toHaveBeenCalledWith({
        where: {
          status: 'ATIVA',
          latitude: { not: null },
          longitude: { not: null },
        },
      });
    });

    it('should format address correctly', async () => {
      mockPrismaService.reseller.findMany.mockResolvedValue([mockResellers[0]]);
      mockGeoService.haversineKm.mockReturnValue(1);

      const dto: SearchResellersDto = {
        latitude: -25.4284,
        longitude: -49.2733,
      };

      const result = await service.search(dto);

      expect(result.results[0].address).toBe(
        'Rua A, 100, Centro, Curitiba, PR'
      );
    });

    it('should generate Google Maps URL', async () => {
      mockPrismaService.reseller.findMany.mockResolvedValue([mockResellers[0]]);
      mockGeoService.haversineKm.mockReturnValue(1);

      const dto: SearchResellersDto = {
        latitude: -25.4284,
        longitude: -49.2733,
      };

      const result = await service.search(dto);

      expect(result.results[0].routeUrl).toBe(
        'https://www.google.com/maps/dir/?api=1&destination=-25.4284,-49.2733'
      );
    });
  });
});
