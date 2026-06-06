import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ตาราง ค่าพลังการ การเงิน %ของดวง' })
export class PowerFinance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'วันบน / เดือนบน' })
  above_id: number;

  @Column({ comment: 'วันล่าง / เดือนล่าง' })
  below_id: number;

  @Column({ comment: 'ลาภบน' })
  fortune_above_id: number;

  @Column({ comment: 'ลาภล่าง' })
  fortune_below_id: number;

  @Column({ comment: 'คะแนน', type: 'float' })
  score: number;

  @Column({ type: 'text', comment: 'คำอธิบายละเอียด' })
  details: string;
}
