import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { Emulator } from '../../emulators/entities/emulator.entity';
import { Users } from "../../users/entities/user.entity";

@Entity()
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.activityLogs, { nullable: true, onDelete: 'NO ACTION'  })
  user: Users;

  @ManyToOne(() => Account, (account) => account.activityLogs, { nullable: true, onDelete: 'SET NULL'  })
  account: Account;

  @ManyToOne(() => Emulator, (emulator) => emulator.activityLogs, { nullable: true, onDelete: 'NO ACTION'  })
  device: Emulator;

  @Column()
  action: string;

  @CreateDateColumn({ type: 'date' })
  timestamp: Date;

  @Column('json')
  metadata: object;
}
