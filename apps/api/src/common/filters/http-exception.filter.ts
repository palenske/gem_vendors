import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string;

    switch (status) {
      case HttpStatus.BAD_REQUEST:
        message = 'Informe ao menos um critério de busca: CEP, endereço ou coordenadas';
        break;
      case HttpStatus.NOT_FOUND:
        message = 'Recurso não encontrado';
        break;
      case HttpStatus.UNPROCESSABLE_ENTITY:
        message = exception.message || 'Não foi possível processar a solicitação';
        break;
      case HttpStatus.SERVICE_UNAVAILABLE:
        message = 'Serviço temporariamente indisponível. Tente novamente.';
        break;
      default:
        message = 'Erro interno do servidor';
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.name,
    });
  }
}
