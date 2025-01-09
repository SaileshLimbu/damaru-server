import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AccountEmulators } from './account-emulators';

@Entity()
export class EmulatorConnections {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AccountEmulators, (accountEmulators) => accountEmulators.accountEmulatorConnections,  { onDelete: 'CASCADE' })
  accountEmulators: AccountEmulators;

  @CreateDateColumn({ type: 'datetime' })
  connected_at: Date;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  disconnected_at: Date;

  @Column({ type: 'text', nullable: true })
  message: string;
}
