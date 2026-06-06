import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'Log AI' })
export class LogAI {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: string;

  @Column()
  ai_type: string; // FORTUNE, GENERAL

  @Column()
  create_at: string;

  @Column({ type: 'text' })
  message: string;
}
