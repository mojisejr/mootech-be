import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'นิสัย' })
export class AnalyticCharacter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'วันบน' })
  day_above_id: number;

  @Column({ comment: 'วันล่าง' })
  day_below_id: number;

  @Column({ type: 'text', comment: 'นิสัย' })
  note: string;
}
