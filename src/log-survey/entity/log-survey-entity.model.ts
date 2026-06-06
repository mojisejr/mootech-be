import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ comment: 'Log แบบทดสอบ' })
export class LogSurvey {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  user_id: string;

  @Column()
  createAt: string;

  @Index()
  @Column()
  code: string;

  @Column({ type: 'text' })
  result: string;
}
