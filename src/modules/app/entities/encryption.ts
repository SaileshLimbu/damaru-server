import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Encryption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean' })
  enabled: boolean;
}
