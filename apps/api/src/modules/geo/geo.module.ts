import { Module } from "@nestjs/common";
import { GeoService } from "./geo.service";
import { GeocodingService } from "./geocoding.service";
import { GeoController } from "./geo.controller";

@Module({
  controllers: [GeoController],
  providers: [GeoService, GeocodingService],
  exports: [GeoService, GeocodingService],
})
export class GeoModule {}
