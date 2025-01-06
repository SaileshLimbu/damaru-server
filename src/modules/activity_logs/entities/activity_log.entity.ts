import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string;

  @CreateDateColumn({ type: 'date' })
  timestamp: Date;

  @Column('json')
  metadata: object;
}
