import { Test, TestingModule } from "@nestjs/testing";
import { GeocodingService } from "./geocoding.service";
import { ConfigService } from "@nestjs/config";
import { HttpException } from "@nestjs/common";

describe("GeocodingService", () => {
  let service: GeocodingService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockConfigService.get.mockReturnValue("test-user-agent");

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeocodingService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<GeocodingService>(GeocodingService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("geocode", () => {
    it("should return coordinates for valid address", async () => {
      const mockResponse = {
        ok: true,
        json: jest
          .fn()
          .mockResolvedValue([{ lat: "-23.5505", lon: "-46.6333" }]),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await service.geocode(
        "Avenida Paulista, São Paulo, Brasil",
      );

      expect(result).toEqual({
        latitude: -23.5505,
        longitude: -46.6333,
      });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("nominatim.openstreetmap.org"),
        expect.objectContaining({
          headers: { "User-Agent": "test-user-agent" },
        }),
      );
    });

    it("should throw HttpException when address not found", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue([]),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      await expect(service.geocode("Nonexistent Address XYZ")).rejects.toThrow(
        HttpException,
      );
    });

    it("should throw HttpException on HTTP error", async () => {
      const mockResponse = {
        ok: false,
        status: 503,
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      await expect(service.geocode("Avenida Paulista")).rejects.toThrow(
        HttpException,
      );
    });

    it("should throw HttpException on network error", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

      await expect(service.geocode("Avenida Paulista")).rejects.toThrow(
        HttpException,
      );
    });

    it("should use default user-agent when config not set", async () => {
      mockConfigService.get.mockReturnValue(undefined);

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          GeocodingService,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      const serviceWithoutConfig =
        module.get<GeocodingService>(GeocodingService);

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue([{ lat: "0", lon: "0" }]),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      await serviceWithoutConfig.geocode("Test");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: { "User-Agent": "localizador-revendedoras-dev" },
        }),
      );
    });
  });


});
