import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({ description: 'Existing password to validate ownership' })
  @IsString()
  currentPassword!: string;

  @ApiProperty({ description: 'New password to set for the account', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword!: string;
}
