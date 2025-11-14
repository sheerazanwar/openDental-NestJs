import { ApiPropertyOptional } from '@nestjs/swagger';

export class OpenDentalInsurancePlanDto {
  @ApiPropertyOptional()
  PlanNum!: string;

  @ApiPropertyOptional()
  CarrierNum?: string;

  @ApiPropertyOptional()
  PlanType?: string;

  @ApiPropertyOptional()
  GroupName?: string;
}
