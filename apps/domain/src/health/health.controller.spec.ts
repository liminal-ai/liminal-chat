import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  type MockedFunction,
} from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";

interface MockHealthService {
  getHealth: MockedFunction<
    () => {
      status: string;
      service: string;
      timestamp: string;
      database: string;
    }
  >;
}

describe("HealthController", () => {
  let controller: HealthController;
  let mockHealthService: MockHealthService;

  beforeEach(async () => {
    mockHealthService = {
      getHealth: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService as unknown as HealthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  describe("getHealth", () => {
    it("should return health status from service", () => {
      // Arrange
      const expectedHealth = {
        status: "ok",
        service: "liminal-chat-domain",
        timestamp: "2024-01-01T00:00:00.000Z",
        database: "connected",
      };
      mockHealthService.getHealth.mockReturnValue(expectedHealth);

      // Act
      const result = controller.getHealth();

      // Assert
      expect(mockHealthService.getHealth).toHaveBeenCalledTimes(1);
      expect(mockHealthService.getHealth).toHaveBeenCalledWith();
      expect(result).toEqual(expectedHealth);
    });

    it("should delegate to health service", () => {
      // Arrange
      const healthResponse = {
        status: "ok",
        service: "liminal-chat-domain",
        timestamp: new Date().toISOString(),
        database: "connected",
      };
      mockHealthService.getHealth.mockReturnValue(healthResponse);

      // Act
      controller.getHealth();

      // Assert
      expect(mockHealthService.getHealth).toHaveBeenCalledOnce();
    });

    it("should return exact response from service", () => {
      // Arrange
      const serviceResponse = {
        status: "ok",
        service: "test-service",
        timestamp: "2023-12-31T23:59:59.999Z",
        database: "connected",
      };
      mockHealthService.getHealth.mockReturnValue(serviceResponse);

      // Act
      const result = controller.getHealth();

      // Assert
      expect(result).toBe(serviceResponse);
      expect(result).toEqual(serviceResponse);
    });

    it("should handle service returning different status", () => {
      // Arrange
      const serviceResponse = {
        status: "degraded",
        service: "liminal-chat-domain",
        timestamp: new Date().toISOString(),
        database: "disconnected",
      };
      mockHealthService.getHealth.mockReturnValue(serviceResponse);

      // Act
      const result = controller.getHealth();

      // Assert
      expect(result.status).toBe("degraded");
      expect(result.database).toBe("disconnected");
    });

    it("should be callable multiple times", () => {
      // Arrange
      const serviceResponse = {
        status: "ok",
        service: "liminal-chat-domain",
        timestamp: new Date().toISOString(),
        database: "connected",
      };
      mockHealthService.getHealth.mockReturnValue(serviceResponse);

      // Act
      controller.getHealth();
      controller.getHealth();
      const result = controller.getHealth();

      // Assert
      expect(mockHealthService.getHealth).toHaveBeenCalledTimes(3);
      expect(result).toEqual(serviceResponse);
    });
  });
});
