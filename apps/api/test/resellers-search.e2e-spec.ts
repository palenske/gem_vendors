import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";

describe("API Integration Tests", () => {
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

  describe("Health Controller", () => {
    it("GET /api/v1/health → 200 with status ok", () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return request(app.getHttpServer())
        .get("/api/v1/health")
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({ status: "ok" });
        });
    });
  });

  describe("CEP Controller", () => {
    it("GET /api/v1/cep/01310-100 → 200 with address", () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return request(app.getHttpServer())
        .get("/api/v1/cep/01310-100")
        .expect(200)
        .expect((res) => {
          const body = res.body as Record<string, string>;
          expect(body.cep).toBe("01310-100");
          expect(body.logradouro).toBe("Avenida Paulista");
          expect(body.bairro).toBe("Bela Vista");
          expect(body.localidade).toBe("São Paulo");
          expect(body.uf).toBe("SP");
        });
    });

    it("GET /api/v1/cep/00000-000 → 404", () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return request(app.getHttpServer())
        .get("/api/v1/cep/00000-000")
        .expect(404);
    });

    it("GET /api/v1/cep/123 → 404 (invalid format)", () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return request(app.getHttpServer()).get("/api/v1/cep/123").expect(404);
    });
  });

  describe("Resellers Controller", () => {
    it("GET /api/v1/resellers/search → 400 (no location criteria)", () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return request(app.getHttpServer())
        .get("/api/v1/resellers/search")
        .expect(400);
    });

    it("GET /api/v1/resellers/search?latitude=-25.4284&longitude=-49.2733 → 200 with results", () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return request(app.getHttpServer())
        .get("/api/v1/resellers/search?latitude=-25.4284&longitude=-49.2733")
        .expect(200)
        .expect((res) => {
          const body = res.body as Record<string, unknown>;
          expect(body).toHaveProperty("origin");
          expect(body).toHaveProperty("results");
          expect(body).toHaveProperty("meta");
          expect(Array.isArray(body.results)).toBe(true);
          const origin = body.origin as Record<string, unknown>;
          expect(origin.latitude).toBe(-25.4284);
          expect(origin.longitude).toBe(-49.2733);
          expect(origin.resolvedFrom).toBe("coordinates");
        });
    }, 30000);

    it("GET /api/v1/resellers/search?zipCode=01310-100 → 200 with results", () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return request(app.getHttpServer())
        .get("/api/v1/resellers/search?zipCode=01310-100")
        .expect(200)
        .expect((res) => {
          const body = res.body as Record<string, unknown>;
          expect(body).toHaveProperty("origin");
          expect(body).toHaveProperty("results");
          expect(body).toHaveProperty("meta");
          expect(Array.isArray(body.results)).toBe(true);
          const origin = body.origin as Record<string, unknown>;
          expect(origin.resolvedFrom).toBe("zipCode");
        });
    }, 30000);
  });
});
