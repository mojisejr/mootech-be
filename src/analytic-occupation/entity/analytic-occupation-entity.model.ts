import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'อาชีพ' })
export class AnalyticOccupation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'ดิถี (ธาตุ) วันบน' })
  day_above_element: string;

  @Column({ comment: 'ลำดับตวามสำคัญ' })
  sequence: number;

  @Column({ type: 'text', comment: 'กลุ่มอาชีพ' })
  topic: string;

  @Column({ type: 'text', comment: 'คำอธิบาย' })
  note: string;
}
