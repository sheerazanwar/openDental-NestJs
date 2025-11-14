import { ApiProperty } from '@nestjs/swagger';

export class OpenDentalEligibilityDto {
  @ApiProperty()
  AptNum!: string;

  @ApiProperty()
  Eligible!: boolean;

  @ApiProperty({ required: false })
  Reason?: string;

  @ApiProperty({ required: false })
  CoverageAmount?: number;

  @ApiProperty({ required: false })
  PatientPortion?: number;
}
