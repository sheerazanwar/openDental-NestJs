import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ClinicsService } from '../clinics/clinics.service';
import { ClaimsService } from '../claims/claims.service';
import { PaymentStatus } from '../common/enums/payment-status.enum';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly repository: Repository<Payment>,
    private readonly clinicsService: ClinicsService,
    private readonly claimsService: ClaimsService,
  ) {}

  async upsert(dto: CreatePaymentDto, user?: AuthenticatedUser): Promise<Payment> {
    const clinic = await this.clinicsService.assertClinicAccess(dto.clinicId, user);
    const claim = await this.claimsService.findOne(dto.claimId, user);

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

  async update(id: string, dto: UpdatePaymentDto, user?: AuthenticatedUser): Promise<Payment> {
    const payment = await this.repository.findOne({ where: { id }, relations: ['clinic', 'claim'] });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    if (user) {
      await this.clinicsService.assertClinicAccess(payment.clinic.id, user);
    }
    Object.assign(payment, dto);
    return this.repository.save(payment);
  }

  async findOne(id: string, user?: AuthenticatedUser): Promise<Payment> {
    const payment = await this.repository.findOne({ where: { id }, relations: ['clinic', 'claim'] });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    if (user) {
      await this.clinicsService.assertClinicAccess(payment.clinic.id, user);
    }
    return payment;
  }

  async list(clinicId?: string, user?: AuthenticatedUser): Promise<Payment[]> {
    const clinicIds = await this.clinicsService.getAccessibleClinicIds(user, clinicId);
    if (!clinicIds.length) {
      return [];
    }
    return this.repository.find({
      where: { clinic: { id: In(clinicIds) } },
      relations: ['clinic', 'claim'],
      order: { createdAt: 'DESC' },
    });
  }
}
