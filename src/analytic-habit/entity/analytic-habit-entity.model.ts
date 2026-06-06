import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'นิสัยตามธาตุ' })
export class AnalyticHabit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'ดิถี (ธาตุ) วันบน' })
  day_above_element: string;

  @Column({ comment: 'พลัง' })
  power: string;

  @Column({ comment: 'ระดับ' })
  level: string;

  @Column({ type: 'text', comment: 'คำอธิบาย' })
  note: string;
}
