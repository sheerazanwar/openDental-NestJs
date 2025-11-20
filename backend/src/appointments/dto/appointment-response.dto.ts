import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentStatus } from '../../common/enums/appointment-status.enum';
import { EligibilityStatus } from '../../common/enums/eligibility-status.enum';
import { PatientResponseDto } from '../../patients/dto/patient-response.dto';

export class AppointmentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  externalAptId!: string;

  @ApiProperty({ enum: AppointmentStatus })
  status!: AppointmentStatus;

  @ApiProperty({ enum: EligibilityStatus })
  eligibilityStatus!: EligibilityStatus;

  @ApiPropertyOptional()
  eligibilityDetails?: Record<string, any>;

  @ApiProperty()
  scheduledStart!: Date;

  @ApiProperty()
  scheduledEnd!: Date;

  @ApiPropertyOptional()
  reason?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  insuranceCoverageAmount?: number;

  @ApiPropertyOptional()
  patientResponsibilityAmount?: number;

  @ApiPropertyOptional()
  discountAmount?: number;

  @ApiPropertyOptional()
  operatory?: string;

  @ApiPropertyOptional()
  providerName?: string;

  @ApiPropertyOptional({ type: () => PatientResponseDto })
  patient?: PatientResponseDto;

  @ApiProperty()
  clinicId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
