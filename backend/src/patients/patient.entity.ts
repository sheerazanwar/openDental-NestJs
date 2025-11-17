import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/utils/base.entity';
import { Clinic } from '../clinics/clinic.entity';
import { Appointment } from '../appointments/appointment.entity';
import { Claim } from '../claims/claim.entity';

@Entity('patients')
export class Patient extends BaseEntity {
  @Column({ unique: true })
  externalId!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ type: 'date', nullable: true })
  birthDate?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @ManyToOne(() => Clinic, (clinic) => clinic.patients)
  clinic!: Clinic;

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments!: Appointment[];

  @OneToMany(() => Claim, (claim) => claim.patient)
  claims!: Claim[];
}
