import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Encryption {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'boolean' })
  enabled: boolean;
}
