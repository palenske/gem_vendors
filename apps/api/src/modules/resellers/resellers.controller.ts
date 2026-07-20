import { Controller, Get, Query } from '@nestjs/common';
import { ResellersService } from './resellers.service';
import { SearchResellersDto } from './dto/search-resellers.dto';
import { SearchResponseDto } from './dto/reseller-response.dto';

@Controller('api/v1/resellers')
export class ResellersController {
  constructor(private readonly resellersService: ResellersService) {}

  @Get('search')
  async search(
    @Query() dto: SearchResellersDto,
  ): Promise<SearchResponseDto> {
    return this.resellersService.search(dto);
  }
}
