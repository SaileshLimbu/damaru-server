import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { UserEmulators } from "./user-emulators";
import { EmulatorStatus } from "../interfaces/emulator.status";
import { EmulatorConnections } from "./emulator-connections";
import { ActivityLog } from "../../activity_logs/entities/activity_log.entity";
import { EmulatorState } from '../interfaces/emulator.state';

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

  @Column({
    transformer: {
      to: (value: EmulatorState) => {
        return value;
      },
      from: (value: string) => {
        return value as EmulatorState;
      }
    }
  })
  state: EmulatorState;


  @CreateDateColumn({ type: 'date' })
  created_at: Date;

  @UpdateDateColumn({ type: 'date' })
  updated_at: Date;

  @OneToMany(() => UserEmulators, (emulatorCode) => emulatorCode.device)
  userEmulators: UserEmulators[];

  @OneToMany(() => EmulatorConnections, (connection) => connection.accountEmulators)
  emulatorConnections: EmulatorConnections[];

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.device)
  activityLogs: ActivityLog[];

  @Column({ nullable: true })
  screenshot: string;
}
