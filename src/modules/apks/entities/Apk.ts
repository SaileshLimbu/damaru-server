import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Apk {
  @PrimaryGeneratedColumn('increment')
  version: number;

  @Column({ default: false })
  force: boolean;

  @Column()
  link: string;
}
