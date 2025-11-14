import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class AdminRegisterDto {
  @ApiProperty({ example: 'admin@example.com', description: 'Unique email used to access the platform' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Jane Doe', description: 'Full legal name of the administrator' })
  @IsString()
  fullName!: string;

  @ApiProperty({ description: 'Strong password with at least 8 characters', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
