import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/utils/base.entity';
import { Admin } from '../admins/admin.entity';
import { UserType } from '../common/enums/user-type.enum';

@Entity('sessions')
export class Session extends BaseEntity {
  @Column({ type: 'simple-enum', enum: UserType })
  userType!: UserType;

  @Column()
  userId!: string;

  @Column({ unique: true })
  refreshTokenHash!: string;

  @Column()
  expiresAt!: Date;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  revokedAt?: Date;

  @ManyToOne(() => Admin, (admin) => admin.sessions, { nullable: true })
  admin?: Admin;
}
