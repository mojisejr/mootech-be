import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ธาตุแข็งอ่อน คำตอบของธาตุ' })
export class AnalyticElementalCharacteristicsElementResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'ดิถี (ธาตุ) วันบน' })
  day_above_element: string;

  @Column({ comment: 'ระดับ' })
  level: string;

  @Column({ comment: 'ธาตุที่ควรปรับใช้' })
  element: string;

  @Column({ comment: 'ลำดับ' })
  sequence: number;
}
