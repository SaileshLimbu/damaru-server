import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { EmulatorCode } from '../../emulators/entities/emulator-code.entity';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.accounts, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  account_name: string;

  @Column({ default: false })
  is_admin: boolean;

  @Column()
  pin: string;

  @CreateDateColumn({ type: 'date' })
  created_at: Date;

  @UpdateDateColumn({ type: 'date' })
  updated_at: Date;

  @OneToMany(() => EmulatorCode, (emulatorCode) => emulatorCode.account)
  emulatorCodes: EmulatorCode[];

  // @OneToMany(() => AccountEmulatorConnection, connection => connection.account)
  // emulatorConnections: AccountEmulatorConnection[];
  //
  // @OneToMany(() => ActivityLog, activityLog => activityLog.account)
  // activityLogs: ActivityLog[];
}
