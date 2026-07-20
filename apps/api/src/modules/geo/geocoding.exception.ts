import { HttpException, HttpStatus } from '@nestjs/common';

export class GeocodingFailedException extends HttpException {
  constructor(
    message: string = 'Não foi possível geocodificar o endereço informado',
    statusCode: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY,
  ) {
    super(message, statusCode);
  }
}
