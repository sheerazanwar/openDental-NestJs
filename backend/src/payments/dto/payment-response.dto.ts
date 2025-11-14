import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '../../common/enums/payment-status.enum';
import { ClaimResponseDto } from '../../claims/dto/claim-response.dto';

export class PaymentResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ enum: PaymentStatus })
  status!: PaymentStatus;

  @ApiProperty()
  amount!: number;

  @ApiPropertyOptional()
  method?: string;

  @ApiPropertyOptional()
  externalPaymentId?: string;

  @ApiPropertyOptional()
  receivedAt?: Date;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ type: () => ClaimResponseDto })
  claim?: ClaimResponseDto;

  @ApiProperty()
  clinicId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
