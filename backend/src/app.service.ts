import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  healthCheck() {
    return {
      status: 'ok',
      environment: this.configService.get('nodeEnv'),
      timestamp: new Date().toISOString(),
    };
  }
}
