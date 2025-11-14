import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '../common/utils/base.entity';
import { Clinic } from '../clinics/clinic.entity';
import { Patient } from '../patients/patient.entity';
import { Appointment } from '../appointments/appointment.entity';
import { ClaimStatus } from '../common/enums/claim-status.enum';
import { Payment } from '../payments/payment.entity';

@Entity('claims')
export class Claim extends BaseEntity {
  @Column({ unique: true })
  externalClaimId!: string;

  @ManyToOne(() => Clinic, (clinic) => clinic.claims)
  clinic!: Clinic;

  @ManyToOne(() => Patient, (patient) => patient.claims, { eager: true })
  patient!: Patient;

  @OneToOne(() => Appointment, (appointment) => appointment.claim, { eager: true })
  @JoinColumn()
  appointment!: Appointment;

  @Column({ type: 'simple-enum', enum: ClaimStatus, default: ClaimStatus.NOT_SUBMITTED })
  status!: ClaimStatus;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amountBilled!: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  amountApproved?: number;

  @Column({ nullable: true })
  rejectionReason?: string;

  @Column({ nullable: true })
  notes?: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ nullable: true })
  lastPolledAt?: Date;

  @OneToOne(() => Payment, (payment) => payment.claim)
  payment?: Payment;
}
