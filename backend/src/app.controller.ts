import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Core')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint used by monitoring systems' })
  @ApiOkResponse({ description: 'Current status of the API', schema: { example: { status: 'ok' } } })
  health() {
    return this.appService.healthCheck();
  }
}
