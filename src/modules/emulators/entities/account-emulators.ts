import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { UserEmulators } from './user-emulators';
import { Account } from '../../accounts/entities/account.entity';
import { EmulatorConnections } from './emulator-connections';

@Entity()
@Unique(['account', 'userEmulator'])
export class AccountEmulators {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Account, (account) => account.id)
  account: Account;

  @ManyToOne(() => UserEmulators, (userEmulator) => userEmulator.accountEmulator)
  userEmulator: UserEmulators;

  @OneToMany(() => EmulatorConnections, (accountEmulatorConnection) => accountEmulatorConnection.accountEmulators)
  accountEmulatorConnections: EmulatorConnections[];

  @Column()
  status: string;
}
