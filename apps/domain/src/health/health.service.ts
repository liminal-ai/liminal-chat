import { Injectable } from "@nestjs/common";

@Injectable()
export class HealthService {
  getHealth() {
    return {
      status: "healthy",
      service: "domain",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    };
  }
}
