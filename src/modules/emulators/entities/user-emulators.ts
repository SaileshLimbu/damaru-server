import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Emulator } from './emulator.entity';
import { Users } from '../../users/entities/user.entity';

@Entity()
export class UserEmulators {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.emulators)
  user: Users;

  @ManyToOne(() => Emulator, (emulator) => emulator.userEmulators)
  device: Emulator;

  @Column()
  expires_at: Date;

  @Column({ type: 'date' })
  linked_at: Date;

  @Column({ type: 'date', nullable: true })
  unlinked_at?: Date;
}
