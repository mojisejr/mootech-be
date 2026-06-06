import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'Fortune Stick Log' })
export class FortuneStick {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  user_id: string;

  @Column()
  mascot_id: number;

  @Column()
  create_at: string;
}
