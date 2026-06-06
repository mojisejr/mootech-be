import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ comment: 'ตารางนับอิม' })
export class ChineseHoroscope8SquareCountingIm {
  @PrimaryColumn({ comment: 'หลัก บน' })
  above_id: number;

  @PrimaryColumn({ comment: 'หลัก ล่าง' })
  below_id: number;

  @Column({ comment: 'ธาตุ' })
  element: string;
}
