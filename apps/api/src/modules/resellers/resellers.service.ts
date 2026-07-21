import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GeoService } from '../geo/geo.service';
import { GeocodingService } from '../geo/geocoding.service';
import { CepService } from '../cep/cep.service';
import { SearchResellersDto, ResellerStatus } from './dto/search-resellers.dto';
import {
  SearchResponseDto,
  ResellerResultDto,
  OriginDto,
} from './dto/reseller-response.dto';

@Injectable()
export class ResellersService {
  private readonly logger = new Logger(ResellersService.name);

  constructor(
    private prisma: PrismaService,
    private geoService: GeoService,
    private geocodingService: GeocodingService,
    private cepService: CepService,
  ) {}

  async search(dto: SearchResellersDto): Promise<SearchResponseDto> {
    const origin = await this.resolveOrigin(dto);

    // Query all resellers with the specified status
    const where: any = {
      status: dto.status || ResellerStatus.ATIVA,
      latitude: { not: null },
      longitude: { not: null },
    };

    if (dto.q) {
      where.OR = [
        { name: { contains: dto.q, mode: 'insensitive' } },
        { street: { contains: dto.q, mode: 'insensitive' } },
        { neighborhood: { contains: dto.q, mode: 'insensitive' } },
        { city: { contains: dto.q, mode: 'insensitive' } },
      ];
    }

    const resellers = await this.prisma.reseller.findMany({
      where,
    });

    // Calculate distances and build results
    let results: ResellerResultDto[] = resellers.map((reseller) => {
      const distanceKm = this.geoService.haversineKm(origin, {
        latitude: reseller.latitude!,
        longitude: reseller.longitude!,
      });

      const address = `${reseller.street}, ${reseller.number}, ${reseller.neighborhood}, ${reseller.city}, ${reseller.state}`;

      return {
        id: reseller.id,
        name: reseller.name,
        address,
        zipCode: reseller.zipCode,
        status: reseller.status as unknown as ResellerStatus,
        distanceKm: Math.round(distanceKm * 100) / 100,
        location: {
          latitude: reseller.latitude!,
          longitude: reseller.longitude!,
        },
        routeUrl: `https://www.google.com/maps/dir/?api=1&destination=${reseller.latitude},${reseller.longitude}`,
      };
    });

    // Filter by radius if provided
    if (dto.radiusKm) {
      results = results.filter((r) => r.distanceKm <= dto.radiusKm!);
    }

    // Sort by distance
    results.sort((a, b) => a.distanceKm - b.distanceKm);

    // Pagination
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const total = results.length;
    const startIndex = (page - 1) * limit;
    const paginatedResults = results.slice(startIndex, startIndex + limit);

    return {
      origin,
      results: paginatedResults,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  private async resolveOrigin(
    dto: SearchResellersDto,
  ): Promise<OriginDto> {
    // If coordinates provided, use them directly
    if (dto.latitude && dto.longitude) {
      return {
        latitude: dto.latitude,
        longitude: dto.longitude,
        resolvedFrom: 'coordinates',
      };
    }

    // If CEP provided, resolve via ViaCEP then geocode
    if (dto.zipCode) {
      const cepResult = await this.cepService.findByZipCode(dto.zipCode);
      const fullAddress = `${cepResult.logradouro}, ${cepResult.bairro}, ${cepResult.localidade}, ${cepResult.uf}, Brasil`;
      const coords = await this.geocodingService.geocode(fullAddress);
      return {
        latitude: coords.latitude,
        longitude: coords.longitude,
        resolvedFrom: 'zipCode',
      };
    }

    // If street/neighborhood provided, geocode the address
    if (dto.street || dto.neighborhood) {
      const parts = [
        dto.street,
        dto.number,
        dto.neighborhood,
        'Brasil',
      ].filter(Boolean);
      const fullAddress = parts.join(', ');
      const coords = await this.geocodingService.geocode(fullAddress);
      return {
        latitude: coords.latitude,
        longitude: coords.longitude,
        resolvedFrom: 'address',
      };
    }

    // This should never happen due to DTO validation
    throw new Error('No location criteria provided');
  }
}
