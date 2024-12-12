import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { Emulator } from './emulator.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class EmulatorLinked {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.emulatorConnections, { nullable: true })
  user: User;

  @ManyToOne(() => Account, (account) => account.emulatorConnections, { nullable: true })
  account: Account;

  @ManyToOne(() => Emulator, (emulator) => emulator.emulatorConnections)
  device: Emulator;

  @CreateDateColumn({ type: 'date', nullable: true })
  connected_at: Date;

  @UpdateDateColumn({ type: 'date', nullable: true })
  disconnected_at: Date;

  @Column({ type: 'date', nullable: true })
  expiry_at: Date;
}
