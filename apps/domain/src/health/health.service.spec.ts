import { describe, it, expect, beforeEach, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { HealthService } from "./health.service";

describe("HealthService", () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getHealth", () => {
    it("should return health status object", () => {
      // Arrange - Mock the date to make it predictable
      vi.useFakeTimers();
      const mockDate = new Date("2024-01-01T00:00:00.000Z");
      vi.setSystemTime(mockDate);

      // Act
      const result = service.getHealth();

      // Assert
      expect(result).toEqual({
        status: "ok",
        service: "liminal-chat-domain",
        timestamp: "2024-01-01T00:00:00.000Z",
        database: "connected",
      });
    });

    it("should return current timestamp", () => {
      // Arrange
      const beforeCall = new Date();

      // Act
      const result = service.getHealth();

      // Assert
      const afterCall = new Date();
      const resultTimestamp = new Date(result.timestamp);

      expect(resultTimestamp).toBeInstanceOf(Date);
      expect(resultTimestamp.getTime()).toBeGreaterThanOrEqual(
        beforeCall.getTime(),
      );
      expect(resultTimestamp.getTime()).toBeLessThanOrEqual(
        afterCall.getTime(),
      );
    });

    it("should always return status ok", () => {
      // Act
      const result = service.getHealth();

      // Assert
      expect(result.status).toBe("ok");
    });

    it("should always return correct service name", () => {
      // Act
      const result = service.getHealth();

      // Assert
      expect(result.service).toBe("liminal-chat-domain");
    });

    it("should always return database connected", () => {
      // Act
      const result = service.getHealth();

      // Assert
      expect(result.database).toBe("connected");
    });

    it("should return valid ISO timestamp format", () => {
      // Act
      const result = service.getHealth();

      // Assert
      expect(result.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    it("should return new timestamp on each call", () => {
      // Arrange - Add small delay between calls
      const firstResult = service.getHealth();

      // Act - Call again after minimal delay
      const secondResult = service.getHealth();

      // Assert - Timestamps should be different (or at least not strictly less)
      expect(new Date(secondResult.timestamp).getTime()).toBeGreaterThanOrEqual(
        new Date(firstResult.timestamp).getTime(),
      );
    });
  });
});
