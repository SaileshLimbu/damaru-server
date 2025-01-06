import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { Role } from './role.entity';
import { UserEmulators } from '../../emulators/entities/user-emulators';

@Entity()
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column()
  password: string;

  @CreateDateColumn({ type: 'date' })
  created_at: Date;

  @UpdateDateColumn({ type: 'date' })
  updated_at: Date;

  @ManyToOne(() => Role, (role) => role.id)
  role: Role;

  @OneToMany(() => Account, (account) => account.user, { onDelete: 'CASCADE' })
  accounts: Account[];

  @OneToMany(() => UserEmulators, (emulator) => emulator.user, { onDelete: 'CASCADE' })
  emulators: UserEmulators[];
}
