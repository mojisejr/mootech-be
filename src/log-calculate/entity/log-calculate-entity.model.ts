import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity({ comment: 'Log การคำนวณ' })
export class LogCalculate {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  user_id: string;

  @Column()
  createAt: string;

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

  @Column({ nullable: true })
  place_name: string;

  @Index()
  @Column()
  code: string;

  @Column({ type: 'text' })
  result: string;
}
