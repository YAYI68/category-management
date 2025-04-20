import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  
  constructor() {
    super();
  }
  
  async onModuleInit() {
    await this.connectWithRetry();
  }

  private async connectWithRetry() {
    const maxRetries = 5;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        await this.$connect();
        this.logger.log('Connected to the database');
        return;
      } catch (error) {
        this.logger.log(
          `Error connecting to the database (Attempt ${retries + 1}):`,
          error.message,
        );
        retries++;
        // Add a small delay before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    throw new Error(
      `Unable to connect to the database after ${maxRetries} attempts`,
    );
  }
}