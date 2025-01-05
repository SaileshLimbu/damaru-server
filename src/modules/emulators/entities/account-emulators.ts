import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { UserEmulators } from './user-emulators';
import { Account } from '../../accounts/entities/account.entity';
import { EmulatorConnections } from './emulator-connections';

@Entity()
@Unique(['account', 'userEmulator'])
export class AccountEmulators {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Account, (account) => account.devices)
  account: Account;

  @ManyToOne(() => UserEmulators, (userEmulator) => userEmulator.accountEmulator)
  userEmulator: UserEmulators;

  @OneToMany(() => EmulatorConnections, (accountEmulatorConnection) => accountEmulatorConnection.accountEmulators,  { onDelete: 'CASCADE' })
  accountEmulatorConnections: EmulatorConnections[];

  @Column()
  status: string;
}
