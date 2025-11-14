import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/utils/base.entity';
import { Admin } from '../admins/admin.entity';
import { Patient } from '../patients/patient.entity';
import { Appointment } from '../appointments/appointment.entity';
import { Claim } from '../claims/claim.entity';
import { Payment } from '../payments/payment.entity';

@Entity('clinics')
export class Clinic extends BaseEntity {
  @Column({ unique: true })
  name!: string;

  @Column()
  addressLine1!: string;

  @Column({ nullable: true })
  addressLine2?: string;

  @Column()
  city!: string;

  @Column()
  state!: string;

  @Column()
  postalCode!: string;

  @Column()
  country!: string;

  @Column()
  contactEmail!: string;

  @Column()
  contactPhone!: string;

  @Column({ default: 'America/New_York' })
  timezone!: string;

  @Column({ nullable: true })
  openDentalApiKey?: string;

  @Column({ nullable: true })
  openDentalApiSecret?: string;

  @ManyToOne(() => Admin, (admin) => admin.clinics, { eager: true })
  admin!: Admin;

  @OneToMany(() => Patient, (patient) => patient.clinic)
  patients!: Patient[];

  @OneToMany(() => Appointment, (appointment) => appointment.clinic)
  appointments!: Appointment[];

  @OneToMany(() => Claim, (claim) => claim.clinic)
  claims!: Claim[];

  @OneToMany(() => Payment, (payment) => payment.clinic)
  payments!: Payment[];
}
