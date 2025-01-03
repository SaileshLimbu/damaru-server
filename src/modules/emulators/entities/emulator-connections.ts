import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AccountEmulators } from './account-emulators';

@Entity()
export class EmulatorConnections {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => AccountEmulators, (accountEmulators) => accountEmulators.accountEmulatorConnections, {
    nullable: true,
    onDelete: 'CASCADE'
  })
  accountEmulators: AccountEmulators;

  @CreateDateColumn({ type: 'date', nullable: true })
  connected_at: Date;

  @UpdateDateColumn({ type: 'date', nullable: true })
  disconnected_at: Date;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'date', nullable: true })
  expiry_at: Date;
}
