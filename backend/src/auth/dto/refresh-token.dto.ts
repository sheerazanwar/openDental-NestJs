import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'Session identifier obtained during login' })
  @IsUUID()
  sessionId!: string;

  @ApiProperty({ description: 'Refresh token returned alongside the access token' })
  @IsString()
  refreshToken!: string;
}
