import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LatLng } from "./geo.service";

export interface ReverseGeocodeResult {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  cep: string;
}

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly nominatimUrl = "https://nominatim.openstreetmap.org/search";
  private readonly userAgent: string;

  constructor(private configService: ConfigService) {
    this.userAgent =
      this.configService.get<string>("NOMINATIM_USER_AGENT") ||
      "localizador-revendedoras-dev";
  }

  async geocode(address: string): Promise<LatLng> {
    try {
      const params = new URLSearchParams({
        q: address,
        format: "json",
        limit: "1",
      });

      const response = await fetch(`${this.nominatimUrl}?${params}`, {
        headers: {
          "User-Agent": this.userAgent,
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        this.logger.error(`Nominatim HTTP error: ${response.status}`);
        throw new HttpException(
          "Serviço de geocodificação temporariamente indisponível",
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      const data = (await response.json()) as Array<{
        lat: string;
        lon: string;
      }>;

      if (data.length === 0) {
        throw new HttpException(
          "Não foi possível geocodificar o endereço informado",
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`Geocoding error: ${String(error)}`);
      throw new HttpException(
        "Serviço de geocodificação temporariamente indisponível",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async reverseGeocode(lat: number, lon: number): Promise<ReverseGeocodeResult> {
    try {
      const params = new URLSearchParams({
        lat: String(lat),
        lon: String(lon),
        format: "json",
        addressdetails: "1",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?${params}`,
        {
          headers: {
            "User-Agent": this.userAgent,
          },
          signal: AbortSignal.timeout(5000),
        },
      );

      if (!response.ok) {
        this.logger.error(`Nominatim reverse HTTP error: ${response.status}`);
        throw new HttpException(
          "Serviço de geocodificação temporariamente indisponível",
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      const data = (await response.json()) as {
        address?: {
          road?: string;
          neighbourhood?: string;
          city?: string;
          state?: string;
          postcode?: string;
        };
        error?: string;
      };

      if (data.error || !data.address) {
        throw new HttpException(
          "Não foi possível resolver o endereço para as coordenadas informadas",
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      const cep = (data.address.postcode || "").replace(/\D/g, "");

      return {
        logradouro: data.address.road || "",
        bairro: data.address.neighbourhood || "",
        localidade: data.address.city || "",
        uf: data.address.state || "",
        cep,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(`Reverse geocoding error: ${String(error)}`);
      throw new HttpException(
        "Serviço de geocodificação temporariamente indisponível",
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
