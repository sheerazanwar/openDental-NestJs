import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/utils/base.entity';
import { Clinic } from '../clinics/clinic.entity';
import { Session } from '../sessions/session.entity';
import { AdminRole } from './enums/admin-role.enum';

@Entity('admins')
export class Admin extends BaseEntity {
  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column()
  fullName!: string;

  @Column({ type: 'enum', enum: AdminRole, default: AdminRole.ADMIN })
  role!: AdminRole;

  @OneToMany(() => Clinic, (clinic) => clinic.admin)
  clinics!: Clinic[];

  @OneToMany(() => Session, (session) => session.admin)
  sessions!: Session[];
}
