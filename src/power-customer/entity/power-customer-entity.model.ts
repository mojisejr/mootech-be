import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ตาราง ค่าพลังการ ลูกค้า %ของดวง' })
export class PowerCustomer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'วันบน' })
  day_above_id: number;

  @Column({ comment: 'วันล่าง' })
  day_below_id: number;

  @Column({ comment: 'ปีบน' })
  year_above_id: number;

  @Column({ comment: 'ปัล่าง' })
  year_below_id: number;

  @Column({ comment: 'คะแนน', type: 'float' })
  score: number;

  @Column({ type: 'text', comment: 'คำอธิบายละเอียด' })
  details: string;
}
