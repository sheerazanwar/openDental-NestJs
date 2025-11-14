import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../common/utils/base.entity';
import { UserType } from '../common/enums/user-type.enum';
import { ActivityAction } from '../common/enums/activity-action.enum';

@Entity('activity_logs')
export class ActivityLog extends BaseEntity {
  @Column({ type: 'simple-enum', enum: UserType })
  userType!: UserType;

  @Column()
  userId!: string;

  @Column({ type: 'simple-enum', enum: ActivityAction })
  action!: ActivityAction;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ nullable: true })
  ipAddress?: string;
}
