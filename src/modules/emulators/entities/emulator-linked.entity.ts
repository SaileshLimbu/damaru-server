import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { Emulator } from './emulator.entity';

@Entity()
export class EmulatorLinked {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, (account) => account.emulatorConnections)
  account: Account;

  @ManyToOne(() => Emulator, (emulator) => emulator.emulatorConnections)
  device: Emulator;

  @CreateDateColumn({ type: 'date', nullable: true })
  connected_at: Date;

  @UpdateDateColumn({ type: 'date', nullable: true })
  disconnected_at: Date;

  @Column({ type: 'date' })
  expiry_at: Date;
}
