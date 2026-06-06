import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ตาราง ดวงสมพงษ์ งาน Description' })
export class CompatibilityWorkDescription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'รหัส code' })
  code: string;

  @Column({ type: 'text', comment: 'คำอธิบาย' })
  note: string;

  @Column({ type: 'text', comment: 'คำอธิบาย คำทำนาย ตัวเรา>เจ้านาย' })
  boss: string;

  @Column({ type: 'text', comment: 'คำอธิบาย คำทำนาย ลูกน้อง>ตัวเรา' })
  employee: string;

  @Column({ type: 'text', comment: 'คำอธิบาย คำทำนาย หุ้นส่วน/เพื่อนร่วมงาน' })
  friend: string;
}
