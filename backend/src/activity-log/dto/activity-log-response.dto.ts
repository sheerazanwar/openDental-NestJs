import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType } from '../../common/enums/user-type.enum';
import { ActivityAction } from '../../common/enums/activity-action.enum';

export class ActivityLogResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: UserType })
  userType!: UserType;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: ActivityAction })
  action!: ActivityAction;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional()
  ipAddress?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
