import { ApiPropertyOptional } from '@nestjs/swagger';

export class OpenDentalBenefitDto {
  @ApiPropertyOptional()
  BenefitNum!: string;

  @ApiPropertyOptional()
  PlanNum?: string;

  @ApiPropertyOptional()
  BenefitType?: string;

  @ApiPropertyOptional()
  MonetaryAmt?: number;
}
