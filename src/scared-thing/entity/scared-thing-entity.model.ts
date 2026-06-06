import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'Scared Thing' })
export class ScaredThing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  url: string;
}
