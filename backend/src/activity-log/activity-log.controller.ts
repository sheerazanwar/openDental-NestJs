import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOkResponse, ApiOperation, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { ActivityLogService } from './activity-log.service';
import { ActivityLogResponseDto } from './dto/activity-log-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Activity Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiExtraModels(ActivityLogResponseDto)
@Controller('activity-logs')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  @ApiOperation({ summary: 'List activity logs for all authenticated users' })
  @ApiOkResponse({
    description: 'Paginated list of activity logs',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(ActivityLogResponseDto) },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async list(@Query() pagination: PaginationDto) {
    const [data, total] = await this.activityLogService.listLogs(pagination);
    return {
      data,
      total,
      page: pagination.page ?? 1,
      limit: pagination.limit ?? 25,
    };
  }
}
