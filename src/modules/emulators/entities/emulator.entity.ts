import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { EmulatorCode } from './emulator-code.entity';
import { EmulatorStatus } from '../interfaces/emulator.status';
import { EmulatorLinked } from './emulator-linked.entity';
import { ActivityLog } from '../../activity_logs/entities/activity_log.entity';

@Entity()
export class Emulator {
  @PrimaryColumn()
  device_id: string;

  @Column({ nullable: true })
  device_name: string;

  @Column({
    transformer: {
      to: (value: EmulatorStatus) => {
        return value; // Save enum as text
      },
      from: (value: string) => {
        return value as EmulatorStatus; // Convert text back to enum
      }
    }
  })
  status: EmulatorStatus;

  @CreateDateColumn({ type: 'date' })
  created_at: Date;

  @UpdateDateColumn({ type: 'date' })
  updated_at: Date;

  @OneToMany(() => EmulatorCode, (emulatorCode) => emulatorCode.device)
  emulatorCodes: EmulatorCode[];

  @OneToMany(() => EmulatorLinked, (connection) => connection.device)
  emulatorConnections: EmulatorLinked[];

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.device)
  activityLogs: ActivityLog[];
}
