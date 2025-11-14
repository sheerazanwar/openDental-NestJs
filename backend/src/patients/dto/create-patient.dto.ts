import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreatePatientDto {
  @ApiProperty({ description: 'OpenDental patient identifier', example: '12345' })
  @IsString()
  externalId!: string;

  @ApiProperty({ example: 'Ava' })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: 'Chen' })
  @IsString()
  lastName!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
