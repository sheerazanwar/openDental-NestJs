import { ApiProperty } from '@nestjs/swagger';

export class OpenDentalClaimDto {
  @ApiProperty()
  ClaimNum!: string;

  @ApiProperty()
  AptNum!: string;

  @ApiProperty()
  Status!: string;

  @ApiProperty({ required: false })
  TotalFee?: number;
}
