import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { Emulator } from '../../emulators/entities/emulator.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.activityLogs, { nullable: true })
  user: User;

  @ManyToOne(() => Account, (account) => account.activityLogs, { nullable: true })
  account: Account;

  @ManyToOne(() => Emulator, (emulator) => emulator.activityLogs, { nullable: true })
  device: Emulator;

  @Column()
  action: string;

  @CreateDateColumn({ type: 'date' })
  timestamp: Date;

  @Column('json')
  metadata: object;
}
