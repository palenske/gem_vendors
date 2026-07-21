import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status: HttpStatus = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const responsePayload = exception.getResponse();
    const message =
      (typeof responsePayload === "object" &&
        responsePayload !== null &&
        "message" in responsePayload &&
        String((responsePayload as Record<string, unknown>).message)) ||
      exception.message ||
      "Erro interno do servidor";

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.name,
    });
  }
}
