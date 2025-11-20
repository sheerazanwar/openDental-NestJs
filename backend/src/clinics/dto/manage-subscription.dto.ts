import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class ManageSubscriptionDto {
  @ApiProperty({ description: 'Subscription identifier in OpenDental' })
  @IsString()
  subscriptionNum!: string;

  @ApiProperty({ description: 'Subscription payload to re-activate the clinic', required: false, type: Object })
  @IsOptional()
  @IsObject()
  payload?: Record<string, any>;
}
