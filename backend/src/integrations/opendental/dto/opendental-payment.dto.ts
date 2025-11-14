import { ApiPropertyOptional } from '@nestjs/swagger';

export class OpenDentalPaymentDto {
  @ApiPropertyOptional()
  PayNum?: string;

  @ApiPropertyOptional()
  ClaimPaymentNum?: string;

  @ApiPropertyOptional()
  Amount?: number;

  @ApiPropertyOptional()
  PatNum?: string;

  @ApiPropertyOptional()
  ClinicNum?: string;
}
