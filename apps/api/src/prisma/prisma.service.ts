import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly maxRetries = 5;
  private readonly retryDelay = 2000; // 2 segundos

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env["DATABASE_URL"],
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  private async connectWithRetry(attempt = 1): Promise<void> {
    try {
      await this.$connect();
      this.logger.log("Successfully connected to database");
    } catch (error) {
      if (attempt < this.maxRetries) {
        this.logger.warn(
          `Database connection attempt ${attempt}/${this.maxRetries} failed. Retrying in ${this.retryDelay}ms...`,
        );
        this.logger.error(error);
        await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        return this.connectWithRetry(attempt + 1);
      }
      this.logger.error(
        `Failed to connect to database after ${this.maxRetries} attempts`,
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log("Disconnected from database");
  }
}
