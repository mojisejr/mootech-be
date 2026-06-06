import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'Heavenly Spirit Card Log' })
export class HeavenlySpiritCardLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  user_id: string;

  @Column()
  card_no: number;

  @Column()
  create_at: string;
}
