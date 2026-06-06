import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ตาราง ค่าพลังการความเข้าใจ %ของดวง Description' })
export class PowerKnowledgeDescription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'รหัส code' })
  code: string;

  @Column({ type: 'text', comment: 'คำอธิบาย' })
  note: string;
}
