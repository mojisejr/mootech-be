import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ความรัก' })
export class AnalyticLove {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'วันบน' })
  day_above_id: number;

  @Column({ comment: 'วันล่าง' })
  day_below_id: number;

  @Column({ type: 'text', comment: 'คำอธิบาย' })
  note: string;
}
