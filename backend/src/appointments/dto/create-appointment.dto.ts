import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { AppointmentStatus } from '../../common/enums/appointment-status.enum';
import { EligibilityStatus } from '../../common/enums/eligibility-status.enum';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'OpenDental appointment identifier', example: '67890' })
  @IsString()
  externalAptId!: string;

  @ApiProperty({ description: 'Patient identifier in the local database' })
  @IsString()
  patientId!: string;

  @ApiProperty({ description: 'Clinic identifier in the local database' })
  @IsString()
  clinicId!: string;

  @ApiProperty()
  @IsDateString()
  scheduledStart!: string;

  @ApiProperty()
  @IsDateString()
  scheduledEnd!: string;

  @ApiPropertyOptional({ enum: AppointmentStatus, default: AppointmentStatus.SCHEDULED })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: EligibilityStatus })
  @IsOptional()
  @IsEnum(EligibilityStatus)
  eligibilityStatus?: EligibilityStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  eligibilityDetails?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  insuranceCoverageAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  patientResponsibilityAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  operatory?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  providerName?: string;
}
