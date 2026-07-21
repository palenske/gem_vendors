import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { GeoModule } from "./modules/geo/geo.module";
import { CepModule } from "./modules/cep/cep.module";
import { ResellersModule } from "./modules/resellers/resellers.module";
import { HealthModule } from "./modules/health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    GeoModule,
    CepModule,
    ResellersModule,
    HealthModule,
  ],
})
export class AppModule {}
