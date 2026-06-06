import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ comment: 'Log Work Vibe' })
export class LogWorkVibe {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  user_id: string;

  @Column()
  createAt: string;

  @Column()
  type: string;

  @Column()
  name: string;

  @Column()
  dob: string;

  @Column()
  time: string;

  @Column({ default: false })
  is_remember_time: boolean;

  @Column({ nullable: true })
  gender: string;

  @Column()
  your_name: string;

  @Column()
  your_dob: string;

  @Column()
  your_time: string;

  @Column({ default: false })
  your_is_remember_time: boolean;

  @Column({ nullable: true })
  your_gender: string;

  @Column({ type: 'text' })
  result: string;
}
