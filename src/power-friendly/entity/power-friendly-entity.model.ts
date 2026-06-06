import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ตาราง ค่าพลังการ เพื่อนฝูง %ของดวง' })
export class PowerFriendly {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'วันบน' })
  day_above_id: number;

  @Column({ comment: 'วันล่าง' })
  day_below_id: number;

  @Column({ comment: 'คะแนน', type: 'float' })
  score: number;

  @Column({ type: 'text', comment: 'คำอธิบายละเอียด' })
  note: string;
}
