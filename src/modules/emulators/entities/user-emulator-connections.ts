import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Account } from "../../accounts/entities/account.entity";
import { Emulator } from "./emulator.entity";
import { Users } from "../../users/entities/user.entity";

@Entity()
export class UserEmulatorConnections {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Users, (user) => user.emulatorConnections, { nullable: true, onDelete: 'CASCADE' })
  user: Users;

  @ManyToOne(() => Account, (account) => account.emulatorConnections, { nullable: true, onDelete: 'CASCADE' })
  account: Account;

  @ManyToOne(() => Emulator, (emulator) => emulator.emulatorConnections, { onDelete: 'CASCADE' })
  device: Emulator;

  @CreateDateColumn({ type: 'date', nullable: true })
  connected_at: Date;

  @UpdateDateColumn({ type: 'date', nullable: true })
  disconnected_at: Date;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'date', nullable: true })
  expiry_at: Date;
}
