import { Controller, Get, Query, ParseFloatPipe } from "@nestjs/common";
import { GeocodingService } from "./geocoding.service";
import { ReverseGeocodeResponseDto } from "./dto/reverse-geocode.dto";

@Controller("api/v1/geo")
export class GeoController {
  constructor(private readonly geocodingService: GeocodingService) {}

  @Get("reverse")
  async reverseGeocode(
    @Query("lat", ParseFloatPipe) lat: number,
    @Query("lon", ParseFloatPipe) lon: number,
  ): Promise<ReverseGeocodeResponseDto> {
    return this.geocodingService.reverseGeocode(lat, lon);
  }
}
