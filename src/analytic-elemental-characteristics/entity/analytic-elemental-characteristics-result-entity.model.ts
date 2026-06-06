import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ธาตุแข็งอ่อน' })
export class AnalyticElementalCharacteristicsResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'ดิถี (ธาตุ) วันบน' })
  day_above_element: string;

  @Column({ comment: 'ระดับ' })
  level: string;

  @Column()
  remark: string;

  @Column({ type: 'float' })
  start_score: number;

  @Column({ type: 'float' })
  end_score: number;
}
