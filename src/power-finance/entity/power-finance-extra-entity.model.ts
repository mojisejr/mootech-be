import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ตาราง ค่าพลังการ การเงิน พิเศษ' })
export class PowerFinanceExtra {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'วันบน' })
  day_above_id: number;

  @Column({ comment: 'วันล่าง' })
  day_below_id: number;

  @Column({ comment: 'คะแนน', type: 'float' })
  score: number;

  @Column({ type: 'text', comment: 'คำอธิบายละเอียด' })
  details: string;
}
