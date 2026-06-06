import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'สิ่งศักดิ์สิทธิ์' })
export class AnalyticSacredThing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'ดิถี (ธาตุ) วันบน' })
  day_above_element: string;

  @Column({ comment: 'ธาตุ' })
  element: string;

  @Column({ comment: 'ระดับ' })
  level: string;

  @Column({ comment: 'ลำดับตวามสำคัญ' })
  sequence: number;

  @Column({ type: 'text', comment: 'คำอธิบาย' })
  note: string;
}
