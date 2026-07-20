import { HttpExceptionFilter } from './http-exception.filter';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: any;
  let mockHost: any;

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

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should handle BAD_REQUEST (400) with Portuguese message', () => {
      const exception = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
      
      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 400,
        message: 'Informe ao menos um critério de busca: CEP, endereço ou coordenadas',
        error: 'HttpException',
      });
    });

    it('should handle NOT_FOUND (404) with Portuguese message', () => {
      const exception = new HttpException('Not Found', HttpStatus.NOT_FOUND);
      
      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 404,
        message: 'Recurso não encontrado',
        error: 'HttpException',
      });
    });

    it('should handle UNPROCESSABLE_ENTITY (422) with custom message', () => {
      const exception = new HttpException('Custom error', HttpStatus.UNPROCESSABLE_ENTITY);
      
      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 422,
        message: 'Custom error',
        error: 'HttpException',
      });
    });

    it('should handle SERVICE_UNAVAILABLE (503) with Portuguese message', () => {
      const exception = new HttpException('Service Unavailable', HttpStatus.SERVICE_UNAVAILABLE);
      
      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 503,
        message: 'Serviço temporariamente indisponível. Tente novamente.',
        error: 'HttpException',
      });
    });

    it('should handle internal server error (500) with generic message', () => {
      const exception = new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
      
      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 500,
        message: 'Erro interno do servidor',
        error: 'HttpException',
      });
    });
  });
});
