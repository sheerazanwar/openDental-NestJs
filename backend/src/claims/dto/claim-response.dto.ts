import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClaimStatus } from '../../common/enums/claim-status.enum';
import { AppointmentResponseDto } from '../../appointments/dto/appointment-response.dto';
import { PatientResponseDto } from '../../patients/dto/patient-response.dto';

export class ClaimResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  externalClaimId!: string;

  @ApiProperty({ enum: ClaimStatus })
  status!: ClaimStatus;

  @ApiProperty()
  amountBilled!: number;

  @ApiPropertyOptional()
  amountApproved?: number;

  @ApiPropertyOptional()
  rejectionReason?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional()
  lastPolledAt?: Date;

  @ApiProperty({ type: () => AppointmentResponseDto })
  appointment!: AppointmentResponseDto;

  @ApiProperty({ type: () => PatientResponseDto })
  patient!: PatientResponseDto;

  @ApiProperty()
  clinicId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
