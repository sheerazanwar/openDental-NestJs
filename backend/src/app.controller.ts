import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { OpenDentalService } from './integrations/opendental/opendental.service';

@ApiTags('Core')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly openDentalService: OpenDentalService,
  ) { }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint used by monitoring systems' })
  @ApiOkResponse({ description: 'Current status of the API', schema: { example: { status: 'ok' } } })
  health() {
    return this.appService.healthCheck();
  }

  @Get('health/opendental')
  @ApiOperation({ summary: 'Test OpenDental API connection' })
  @ApiOkResponse({
    description: 'OpenDental API connection status',
    schema: {
      example: {
        success: true,
        message: 'Connected successfully',
        baseUrl: 'https://api.opendental.com/api/v1',
        timestamp: '2025-12-04T10:00:00.000Z',
      },
    },
  })
  async testOpenDentalConnection() {
    return this.openDentalService.testConnection();
  }
}
