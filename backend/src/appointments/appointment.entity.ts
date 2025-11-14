import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '../common/utils/base.entity';
import { Clinic } from '../clinics/clinic.entity';
import { Patient } from '../patients/patient.entity';
import { AppointmentStatus } from '../common/enums/appointment-status.enum';
import { EligibilityStatus } from '../common/enums/eligibility-status.enum';
import { Claim } from '../claims/claim.entity';

@Entity('appointments')
export class Appointment extends BaseEntity {
  @Column({ unique: true })
  externalAptId!: string;

  @ManyToOne(() => Clinic, (clinic) => clinic.appointments)
  clinic!: Clinic;

  @ManyToOne(() => Patient, (patient) => patient.appointments, { eager: true })
  patient!: Patient;

  @Column()
  scheduledStart!: Date;

  @Column()
  scheduledEnd!: Date;

  @Column({ type: 'simple-enum', enum: AppointmentStatus, default: AppointmentStatus.SCHEDULED })
  status!: AppointmentStatus;

  @Column({ nullable: true })
  reason?: string;

  @Column({ nullable: true })
  notes?: string;

  @Column({ type: 'simple-enum', enum: EligibilityStatus, default: EligibilityStatus.PENDING })
  eligibilityStatus!: EligibilityStatus;

  @Column({ nullable: true, type: 'simple-json' })
  eligibilityDetails?: Record<string, any>;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  insuranceCoverageAmount?: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  patientResponsibilityAmount?: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  discountAmount?: number;

  @Column({ nullable: true })
  operatory?: string;

  @Column({ nullable: true })
  providerName?: string;

  @OneToOne(() => Claim, (claim) => claim.appointment, { nullable: true })
  claim?: Claim;
}
