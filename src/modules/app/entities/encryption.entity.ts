import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class EncryptionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean' })
  enabled: boolean;
}
