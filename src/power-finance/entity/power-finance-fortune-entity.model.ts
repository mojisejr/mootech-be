import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ตาราง ลาภแท้ ลาภแฝง' })
export class PowerFinanceFortune {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'วันบน' })
  day_above_id: number;

  @Column({ comment: 'chinese_symbol_id เป็น บน หรือ ล่าง' })
  is_above: boolean;

  @Column({ comment: 'chinese_symbol_id เป็น ลาภแฝง หรือ ลาภแท้' })
  is_real: boolean;

  @Column({ comment: 'บน หรือ ล่าง' })
  chinese_symbol_id: number;
}
