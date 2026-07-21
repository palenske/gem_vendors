import { Module } from "@nestjs/common";
import { ResellersService } from "./resellers.service";
import { ResellersController } from "./resellers.controller";
import { GeoModule } from "../geo/geo.module";
import { CepModule } from "../cep/cep.module";

@Module({
  imports: [GeoModule, CepModule],
  providers: [ResellersService],
  controllers: [ResellersController],
})
export class ResellersModule {}
