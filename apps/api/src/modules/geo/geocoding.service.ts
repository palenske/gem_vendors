import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeocodingFailedException } from './geocoding.exception';
import { LatLng } from './geo.service';

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly nominatimUrl = 'https://nominatim.openstreetmap.org/search';
  private readonly userAgent: string;

  constructor(private configService: ConfigService) {
    this.userAgent =
      this.configService.get<string>('NOMINATIM_USER_AGENT') ||
      'localizador-revendedoras-dev';
  }

  async geocode(address: string): Promise<LatLng> {
    try {
      const params = new URLSearchParams({
        q: address,
        format: 'json',
        limit: '1',
      });

      const response = await fetch(`${this.nominatimUrl}?${params}`, {
        headers: {
          'User-Agent': this.userAgent,
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        this.logger.error(`Nominatim HTTP error: ${response.status}`);
        throw new GeocodingFailedException(
          'Serviço de geocodificação temporariamente indisponível',
          503,
        );
      }

      const data = (await response.json()) as Array<{
        lat: string;
        lon: string;
      }>;

      if (data.length === 0) {
        throw new GeocodingFailedException(
          'Não foi possível geocodificar o endereço informado',
        );
      }

      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    } catch (error) {
      if (error instanceof GeocodingFailedException) {
        throw error;
      }

      this.logger.error(`Geocoding error: ${error}`);
      throw new GeocodingFailedException(
        'Serviço de geocodificação temporariamente indisponível',
        503,
      );
    }
  }
}
