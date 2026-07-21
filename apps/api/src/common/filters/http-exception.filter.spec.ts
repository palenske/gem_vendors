import { HttpExceptionFilter } from "./http-exception.filter";
import { ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";

describe("HttpExceptionFilter", () => {
  let filter: HttpExceptionFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
  });

  it("should be defined", () => {
    expect(filter).toBeDefined();
  });

  describe("catch", () => {
    it("should handle BAD_REQUEST (400) with exception message", () => {
      const exception = new HttpException(
        "Informe ao menos um critério de busca: CEP, endereço ou coordenadas",
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 400,
        message:
          "Informe ao menos um critério de busca: CEP, endereço ou coordenadas",
        error: "HttpException",
      });
    });

    it("should handle NOT_FOUND (404) with exception message", () => {
      const exception = new HttpException(
        "Recurso não encontrado",
        HttpStatus.NOT_FOUND,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 404,
        message: "Recurso não encontrado",
        error: "HttpException",
      });
    });

    it("should handle UNPROCESSABLE_ENTITY (422) with custom message", () => {
      const exception = new HttpException(
        "Não foi possível geocodificar o endereço informado",
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 422,
        message: "Não foi possível geocodificar o endereço informado",
        error: "HttpException",
      });
    });

    it("should handle SERVICE_UNAVAILABLE (503) with exception message", () => {
      const exception = new HttpException(
        "Serviço temporariamente indisponível. Tente novamente.",
        HttpStatus.SERVICE_UNAVAILABLE,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 503,
        message: "Serviço temporariamente indisponível. Tente novamente.",
        error: "HttpException",
      });
    });

    it("should handle internal server error (500) with generic fallback", () => {
      const exception = new HttpException(
        "Internal Server Error",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 500,
        message: "Internal Server Error",
        error: "HttpException",
      });
    });
  });
});
