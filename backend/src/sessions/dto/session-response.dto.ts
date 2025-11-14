import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType } from '../../common/enums/user-type.enum';

export class SessionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: UserType })
  userType!: UserType;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  expiresAt!: Date;

  @ApiPropertyOptional()
  revokedAt?: Date;

  @ApiPropertyOptional()
  userAgent?: string;

  @ApiPropertyOptional()
  ipAddress?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
