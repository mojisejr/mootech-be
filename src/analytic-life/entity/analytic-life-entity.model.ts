import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'กราฟชีวิต' })
export class AnalyticLife {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'วันบน' })
  day_above_id: number;

  @Column({ comment: 'บน หรือ ล่างของวัยจร กราฟชีวิต' })
  day_above_below_id: number;

  @Column({ comment: 'day_above_below_id เป็น บน หรือ ล่าง' })
  is_above: boolean;

  @Column({ comment: 'คะแนน เต็ม 110' })
  score: number;

  @Column({ type: 'text', comment: 'คำอธิบาย วัยเด็ก ช่อง 1-2' })
  child: string;

  @Column({ type: 'text', comment: 'คำอธิบาย วัยจร ช่อง 3-4' })
  teen: string;

  @Column({ type: 'text', comment: 'คำอธิบาย วัยทำงาน ช่อง 5-12' })
  adult: string;

  @Column({ type: 'text', comment: 'คำอธิบาย วันสูงอายุ ช่อง 13-18' })
  elder: string;

  @Column({ type: 'text', comment: 'ความหมาย' })
  description: string;
}
