import { Injectable } from "@nestjs/common";

@Injectable()
export class HealthService {
  getHealth() {
    return {
      status: "ok",
      service: "liminal-chat-domain",
      timestamp: new Date().toISOString(),
      database: "connected",
    };
  }
}
