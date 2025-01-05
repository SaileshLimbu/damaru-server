import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Emulator } from '../../emulators/entities/emulator.entity';

@Entity()
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Emulator, (emulator) => emulator.activityLogs, { nullable: true, onDelete: 'NO ACTION' })
  device: Emulator;

  @Column()
  action: string;

  @CreateDateColumn({ type: 'date' })
  timestamp: Date;

  @Column('json')
  metadata: object;
}
