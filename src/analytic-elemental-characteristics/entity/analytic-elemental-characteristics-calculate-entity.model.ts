import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'คำนวณ ธาตุแข็งอ่อน' })
export class AnalyticElementalCharacteristicsCalculate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'ดิถี (ธาตุ) วันบน' })
  day_above_element: string;

  @Column({ comment: 'ตำแหน่ง 8 ช่อง' })
  detail: string;

  @Column({ comment: 'น้ำหนัก', type: 'float' })
  weight: number;

  @Column({ type: 'json', comment: 'เกณฑ์คำนวณ', nullable: true })
  gain_elements: string[];
}
