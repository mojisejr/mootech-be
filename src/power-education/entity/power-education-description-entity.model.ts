import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ตาราง ค่าพลังการ การศึกษา %ของดวง Description' })
export class PowerEducationDescription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'รหัส code' })
  code: string;

  @Column({ type: 'text', comment: 'คำอธิบาย' })
  note: string;
}
