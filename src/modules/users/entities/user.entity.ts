import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Account } from "../../accounts/entities/account.entity";
import { ActivityLog } from "../../activity_logs/entities/activity_log.entity";
import { Role } from "./role.entity";
import { UserEmulatorConnections } from "../../emulators/entities/user-emulator-connections";
import { UserEmulators } from "../../emulators/entities/user-emulators";

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @CreateDateColumn({ type: 'date' })
  created_at: Date;

  @UpdateDateColumn({ type: 'date' })
  updated_at: Date;

  @ManyToOne(() => Role, (role) => role.id)
  role: Role;

  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.account)
  activityLogs: ActivityLog[];

  @OneToMany(() => UserEmulators, (emulator) => emulator.device)
  emulators: UserEmulators[];

  @OneToMany(() => UserEmulatorConnections, (connection) => connection.device)
  emulatorConnections: UserEmulatorConnections[];
}
