import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ตาราง ทำนาย งาน' })
export class PredictionWork {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'วันบน' })
  day_above_id: number;

  @Column({ comment: 'วันล่าง' })
  day_below_id: number;

  @Column({ comment: 'เดือนบน' })
  month_above_id: number;

  @Column({ comment: 'เดือนล่าง' })
  month_below_id: number;

  @Column({ comment: 'คะแนน', type: 'float' })
  score: number;

  @Column({ type: 'text', comment: 'คำอธิบายละเอียด' })
  details: string;
}
