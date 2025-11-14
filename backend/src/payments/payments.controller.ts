import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ClaimResponseDto } from '../claims/dto/claim-response.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update payment information from OpenDental claim payments feed' })
  @ApiOkResponse({ type: PaymentResponseDto })
  async upsert(@Body() dto: CreatePaymentDto) {
    const payment = await this.paymentsService.upsert(dto);
    return this.toDto(payment);
  }

  @Get()
  @ApiOperation({ summary: 'List payments, optionally filtered by clinic' })
  @ApiQuery({ name: 'clinicId', required: false })
  @ApiOkResponse({ type: PaymentResponseDto, isArray: true })
  async findAll(@Query('clinicId') clinicId?: string) {
    const payments = await this.paymentsService.list(clinicId);
    return payments.map((payment) => this.toDto(payment));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve payment details including associated claim' })
  @ApiOkResponse({ type: PaymentResponseDto })
  async findOne(@Param('id') id: string) {
    const payment = await this.paymentsService.findOne(id);
    return this.toDto(payment);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update payment metadata and reconciliation status' })
  @ApiOkResponse({ type: PaymentResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    const payment = await this.paymentsService.update(id, dto);
    return this.toDto(payment);
  }

  private toDto(payment: any): PaymentResponseDto {
    const claim: ClaimResponseDto | undefined = payment.claim
      ? {
          id: payment.claim.id,
          externalClaimId: payment.claim.externalClaimId,
          status: payment.claim.status,
          amountBilled: payment.claim.amountBilled,
          amountApproved: payment.claim.amountApproved,
          rejectionReason: payment.claim.rejectionReason,
          notes: payment.claim.notes,
          metadata: payment.claim.metadata,
          lastPolledAt: payment.claim.lastPolledAt,
          appointment: undefined,
          patient: undefined,
          clinicId: payment.claim.clinic?.id,
          createdAt: payment.claim.createdAt,
          updatedAt: payment.claim.updatedAt,
        }
      : undefined;

    return {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      method: payment.method,
      externalPaymentId: payment.externalPaymentId,
      receivedAt: payment.receivedAt,
      metadata: payment.metadata,
      claim,
      clinicId: payment.clinic?.id,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    } as PaymentResponseDto;
  }
}
