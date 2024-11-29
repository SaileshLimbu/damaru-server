import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EmulatorCode } from './emulator-code.entity';
import { EmulatorStatus } from '../interfaces/emulator.status';

@Entity()
export class Emulator {
  @PrimaryColumn()
  device_id: string;

  @Column({ nullable: true })
  device_name: string;

  @Column({
    type: 'text',
    transformer: {
      to: (value: EmulatorStatus) => value, // Save enum as text
      from: (value: string) =>
        EmulatorStatus[value.toUpperCase()] as EmulatorStatus, // Convert text back to enum
    },
  })
  status: EmulatorStatus;
  @CreateDateColumn({ type: 'date' })
  created_at: Date;

  @UpdateDateColumn({ type: 'date' })
  updated_at: Date;

  @OneToMany(() => EmulatorCode, (emulatorCode) => emulatorCode.device)
  emulatorCodes: EmulatorCode[];

  // @OneToMany(() => AccountEmulatorConnection, (connection) => connection.device)
  // emulatorConnections: AccountEmulatorConnection[];
  //
  // @OneToMany(() => ActivityLog, (activityLog) => activityLog.device)
  // activityLogs: ActivityLog[];
}
