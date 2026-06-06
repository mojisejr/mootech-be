import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ทิศ' })
export class Direction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column({ type: 'text' })
  description: string;
}
