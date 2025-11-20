import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ClinicsService } from '../clinics/clinics.service';
import { ClaimsService } from '../claims/claims.service';
import { PaymentStatus } from '../common/enums/payment-status.enum';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly repository: Repository<Payment>,
    private readonly clinicsService: ClinicsService,
    private readonly claimsService: ClaimsService,
  ) {}

  async upsert(dto: CreatePaymentDto): Promise<Payment> {
    const clinic = await this.clinicsService.findOne(dto.clinicId);
    const claim = await this.claimsService.findOne(dto.claimId);

    let payment = await this.repository.findOne({ where: { claim: { id: claim.id } }, relations: ['claim'] });
    if (!payment) {
      payment = this.repository.create({
        clinic,
        claim,
        amount: dto.amount,
        status: dto.status ?? PaymentStatus.PENDING,
        method: dto.method,
        externalPaymentId: dto.externalPaymentId,
      });
    }

    Object.assign(payment, {
      clinic,
      claim,
      amount: dto.amount ?? payment.amount,
      status: dto.status ?? payment.status ?? PaymentStatus.PENDING,
      method: dto.method ?? payment.method,
      externalPaymentId: dto.externalPaymentId ?? payment.externalPaymentId,
    });

    return this.repository.save(payment);
  }

  async update(id: string, dto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.repository.findOne({ where: { id }, relations: ['clinic', 'claim'] });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    Object.assign(payment, dto);
    return this.repository.save(payment);
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.repository.findOne({ where: { id }, relations: ['clinic', 'claim'] });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async list(clinicId?: string): Promise<Payment[]> {
    return this.repository.find({
      where: clinicId ? { clinic: { id: clinicId } } : {},
      relations: ['clinic', 'claim'],
      order: { createdAt: 'DESC' },
    });
  }
}
