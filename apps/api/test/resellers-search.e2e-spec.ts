import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('API Integration Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Controller', () => {
    it('GET /api/v1/health → 200 with status ok', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({ status: 'ok' });
        });
    });
  });

  describe('CEP Controller', () => {
    it('GET /api/v1/cep/01310-100 → 200 with address', () => {
      return request(app.getHttpServer())
        .get('/api/v1/cep/01310-100')
        .expect(200)
        .expect((res) => {
          expect(res.body.cep).toBe('01310-100');
          expect(res.body.logradouro).toBe('Avenida Paulista');
          expect(res.body.bairro).toBe('Bela Vista');
          expect(res.body.localidade).toBe('São Paulo');
          expect(res.body.uf).toBe('SP');
        });
    });

    it('GET /api/v1/cep/00000-000 → 404', () => {
      return request(app.getHttpServer())
        .get('/api/v1/cep/00000-000')
        .expect(404);
    });

    it('GET /api/v1/cep/123 → 404 (invalid format)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/cep/123')
        .expect(404);
    });
  });

  describe('Resellers Controller', () => {
    it('GET /api/v1/resellers/search → 400 (no location criteria)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/resellers/search')
        .expect(400);
    });

    it('GET /api/v1/resellers/search?latitude=-25.4284&longitude=-49.2733 → 200 with results', () => {
      return request(app.getHttpServer())
        .get('/api/v1/resellers/search?latitude=-25.4284&longitude=-49.2733')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('origin');
          expect(res.body).toHaveProperty('results');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.results)).toBe(true);
          expect(res.body.origin.latitude).toBe(-25.4284);
          expect(res.body.origin.longitude).toBe(-49.2733);
          expect(res.body.origin.resolvedFrom).toBe('coordinates');
        });
    }, 30000);

    it('GET /api/v1/resellers/search?zipCode=01310-100 → 200 with results', () => {
      return request(app.getHttpServer())
        .get('/api/v1/resellers/search?zipCode=01310-100')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('origin');
          expect(res.body).toHaveProperty('results');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.results)).toBe(true);
          expect(res.body.origin.resolvedFrom).toBe('zipCode');
        });
    }, 30000);
  });
});
