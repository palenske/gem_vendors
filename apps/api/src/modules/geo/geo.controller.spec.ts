import { Test, TestingModule } from "@nestjs/testing";
import { GeoController } from "./geo.controller";
import { GeocodingService } from "./geocoding.service";

describe("GeoController", () => {
  let controller: GeoController;
  let geocodingService: GeocodingService;

  const mockGeocodingService = {
    reverseGeocode: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeoController],
      providers: [
        { provide: GeocodingService, useValue: mockGeocodingService },
      ],
    }).compile();

    controller = module.get<GeoController>(GeoController);
    geocodingService = module.get<GeocodingService>(GeocodingService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("reverseGeocode", () => {
    it("should return address for valid coordinates", async () => {
      mockGeocodingService.reverseGeocode.mockResolvedValue({
        logradouro: "Avenida Paulista",
        bairro: "Bela Vista",
        localidade: "São Paulo",
        uf: "SP",
        cep: "01310100",
      });

      const result = await controller.reverseGeocode(-23.5505, -46.6333);

      expect(result).toEqual({
        logradouro: "Avenida Paulista",
        bairro: "Bela Vista",
        localidade: "São Paulo",
        uf: "SP",
        cep: "01310100",
      });
      expect(geocodingService.reverseGeocode).toHaveBeenCalledWith(
        -23.5505,
        -46.6333,
      );
    });

    it("should propagate errors from GeocodingService", async () => {
      mockGeocodingService.reverseGeocode.mockRejectedValue(
        new Error("Service unavailable"),
      );

      await expect(
        controller.reverseGeocode(-23.5505, -46.6333),
      ).rejects.toThrow("Service unavailable");
    });
  });
});
