import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ comment: 'Log Activity' })
export class LogActivity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  user_id: string;

  @Column()
  createAt: string;

  @Column()
  activity_id: number;

  @Column()
  point: number;
}
