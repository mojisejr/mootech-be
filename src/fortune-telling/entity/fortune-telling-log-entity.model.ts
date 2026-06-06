import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'Fortune Telling Log' })
export class FortuneTellingLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  user_id: string;

  @Column()
  card_no: number;

  @Column()
  create_at: string;
}
