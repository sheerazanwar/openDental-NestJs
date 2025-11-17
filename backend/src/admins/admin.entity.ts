import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/utils/base.entity';
import { Clinic } from '../clinics/clinic.entity';
import { Session } from '../sessions/session.entity';

@Entity('admins')
export class Admin extends BaseEntity {
  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column()
  fullName!: string;

  @OneToMany(() => Clinic, (clinic) => clinic.admin)
  clinics!: Clinic[];

  @OneToMany(() => Session, (session) => session.admin)
  sessions!: Session[];
}
