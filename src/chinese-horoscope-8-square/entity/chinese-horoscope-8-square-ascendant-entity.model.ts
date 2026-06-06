import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ comment: 'คำนวณลัคนา' })
export class ChineseHoroscope8SquareAscendant {
  @PrimaryColumn({ comment: 'ปีบน' })
  year_above_id: number;

  @PrimaryColumn({ comment: 'หลัก ลัคนา บน' })
  ascendant_above_id: number;

  @PrimaryColumn({ comment: 'หลัก ลัคนา ล่าง' })
  ascendant_below_id: number;
}
