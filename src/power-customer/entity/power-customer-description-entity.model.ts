import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ตาราง ค่าพลังการ ลูกค้า %ของดวง Description' })
export class PowerCustomerDescription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'รหัส code' })
  code: string;

  @Column({ type: 'text', comment: 'คำอธิบาย' })
  note: string;
}
