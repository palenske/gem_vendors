import { Module } from '@nestjs/common';
import { GeoService } from './geo.service';
import { GeocodingService } from './geocoding.service';

@Module({
  providers: [GeoService, GeocodingService],
  exports: [GeoService, GeocodingService],
})
export class GeoModule {}
