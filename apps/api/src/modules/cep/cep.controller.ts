import { Controller, Get, Param } from "@nestjs/common";
import { CepService } from "./cep.service";
import { CepResponseDto } from "./dto/cep-response.dto";

@Controller("api/v1/cep")
export class CepController {
  constructor(private readonly cepService: CepService) {}

  @Get(":zipCode")
  async findByZipCode(
    @Param("zipCode") zipCode: string,
  ): Promise<CepResponseDto> {
    return this.cepService.findByZipCode(zipCode);
  }
}
