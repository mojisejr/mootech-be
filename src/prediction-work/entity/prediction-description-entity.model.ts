import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ตาราง ทำนาย งาน Description' })
export class PredictionWorkDescription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'รหัส code' })
  code: string;

  @Column({ type: 'text', comment: 'คำอธิบาย' })
  note: string;
}
