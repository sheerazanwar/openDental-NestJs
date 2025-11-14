import { ApiPropertyOptional } from '@nestjs/swagger';

export class OpenDentalSubscriberDto {
  @ApiPropertyOptional()
  InsSubNum!: string;

  @ApiPropertyOptional()
  PlanNum?: string;

  @ApiPropertyOptional()
  SubscriberID?: string;

  @ApiPropertyOptional()
  PatNum?: string;
}
