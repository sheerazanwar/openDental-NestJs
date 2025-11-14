import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({ description: 'JWT access token used for authenticated requests' })
  accessToken!: string;

  @ApiProperty({ description: 'Identifier of the persisted session', example: 'c4f1a82c-1261-4e5c-8bcc-0f82b54060df' })
  sessionId!: string;

  @ApiProperty({ description: 'Access token expiration in seconds', example: 3600 })
  expiresIn!: number;

  @ApiProperty({ description: 'Refresh token used to obtain a new access token' })
  refreshToken!: string;
}
