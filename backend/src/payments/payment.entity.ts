import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '../common/utils/base.entity';
import { Clinic } from '../clinics/clinic.entity';
import { Claim } from '../claims/claim.entity';
import { PaymentStatus } from '../common/enums/payment-status.enum';

@Entity('payments')
export class Payment extends BaseEntity {
  @ManyToOne(() => Clinic, (clinic) => clinic.payments)
  clinic!: Clinic;

  @OneToOne(() => Claim, (claim) => claim.payment, { eager: true })
  @JoinColumn()
  claim!: Claim;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: 'simple-enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Column({ nullable: true })
  method?: string;

  @Column({ nullable: true })
  externalPaymentId?: string;

  @Column({ nullable: true })
  receivedAt?: Date;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;
}
