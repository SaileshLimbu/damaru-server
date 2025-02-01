import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Apk {
  @PrimaryColumn()
  version: number;

  @Column({ default: false })
  force: boolean;

  @Column()
  link: string;
}
