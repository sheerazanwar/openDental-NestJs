import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ClaimStatus } from '../../common/enums/claim-status.enum';

export class CreateClaimDto {
  @ApiProperty({ description: 'OpenDental claim identifier', example: 'CLM-123' })
  @IsString()
  externalClaimId!: string;

  @ApiProperty()
  @IsString()
  clinicId!: string;

  @ApiProperty()
  @IsString()
  patientId!: string;

  @ApiProperty()
  @IsString()
  appointmentId!: string;

  @ApiProperty({ enum: ClaimStatus, default: ClaimStatus.NOT_SUBMITTED })
  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;

  @ApiProperty()
  @IsNumber()
  amountBilled!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  amountApproved?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
