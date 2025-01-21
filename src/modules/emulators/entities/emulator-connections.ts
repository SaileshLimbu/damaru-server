import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AccountEmulators } from './account-emulators';

@Entity()
export class EmulatorConnections {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => AccountEmulators, (accountEmulators) => accountEmulators.accountEmulatorConnections,  { onDelete: 'CASCADE' })
  accountEmulators: AccountEmulators;

  @CreateDateColumn({ type: 'timestamp' })
  connected_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  disconnected_at: Date;

  @Column({ type: 'text', nullable: true })
  message: string;
}
