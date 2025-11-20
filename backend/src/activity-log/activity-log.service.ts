import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './activity-log.entity';
import { ActivityAction } from '../common/enums/activity-action.enum';
import { UserType } from '../common/enums/user-type.enum';
import { PaginationDto } from '../common/dto/pagination.dto';

export interface CreateActivityLogInput {
  userType: UserType;
  userId: string;
  action: ActivityAction;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly repository: Repository<ActivityLog>,
  ) {}

  async createLog(input: CreateActivityLogInput): Promise<ActivityLog> {
    const log = this.repository.create(input);
    return this.repository.save(log);
  }

  async listLogs(pagination: PaginationDto): Promise<[ActivityLog[], number]> {
    const page = pagination.page ?? 1;
    const limit = pagination.limit ?? 25;
    return this.repository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
