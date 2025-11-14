import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface TemporalJobOptions {
  workflow: string;
  taskQueue?: string;
  payload?: Record<string, any>;
}

@Injectable()
export class TemporalService {
  private readonly logger = new Logger(TemporalService.name);
  private readonly namespace: string;

  constructor(private readonly configService: ConfigService) {
    this.namespace = this.configService.get<string>('temporal.namespace') ?? 'default';
  }

  async enqueueJob(options: TemporalJobOptions): Promise<void> {
    this.logger.log(
      `Queuing Temporal workflow ${options.workflow} in namespace ${this.namespace} with payload ${JSON.stringify(options.payload)}`,
    );
  }
}
