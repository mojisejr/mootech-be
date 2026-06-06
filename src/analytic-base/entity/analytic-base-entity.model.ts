import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'พื้นฐานนิสัย' })
export class AnalyticBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'ดิถี (ธาตุ) วันบน' })
  element: string;

  @Column({ comment: 'พลัง' })
  power: string;

  @Column({ type: 'text' })
  note: string;
}
