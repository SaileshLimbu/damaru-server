import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Users } from "../../users/entities/user.entity";
import { UserEmulatorConnections } from "../../emulators/entities/user-emulator-connections";
import { ActivityLog } from "../../activity_logs/entities/activity_log.entity";

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.accounts, { onDelete: 'CASCADE' })
  user: Users;

  @Column()
  account_name: string;

  @Column({ default: true })
  first_login: boolean;

  @Column({ default: false })
  is_admin: boolean;

  @Column()
  pin: string;

  @CreateDateColumn({ type: 'date' })
  created_at: Date;

  @UpdateDateColumn({ type: 'date' })
  updated_at: Date;

  @Column({ type: 'date', nullable: true})
  last_login: Date;

  @OneToMany(() => UserEmulatorConnections, (connection) => connection.account)
  emulatorConnections: UserEmulatorConnections[];

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.account)
  activityLogs: ActivityLog[];
}
