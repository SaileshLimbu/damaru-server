import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { Emulator } from './emulator.entity';

@Entity()
export class EmulatorCode {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, (account) => account.emulatorCodes, {
    nullable: true,
  })
  account: Account;

  @ManyToOne(() => Emulator, (emulator) => emulator.emulatorCodes)
  device: Emulator;

  @Column({ unique: true })
  code: string;

  @Column()
  expires_at: Date;

  @CreateDateColumn({ type: 'date' })
  created_at: Date;
}
