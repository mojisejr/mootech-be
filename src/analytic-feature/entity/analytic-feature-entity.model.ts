import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'คุณสมบัติตามธาตุ' })
export class AnalyticFeature {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'ธาตุ' })
  element: string;

  @Column({ type: 'text', comment: 'พฤติกรรมเสริมดวง' })
  behavior: string;

  @Column({ type: 'text', comment: 'อาชีพถูกดวง' })
  occupations: string;

  @Column({ type: 'text', comment: 'สีมงคล' })
  colors: string;

  @Column({ type: 'text', comment: 'สิ่งศักดิ์สิทธิเสริมดวง' })
  sacred_things: string;
}
