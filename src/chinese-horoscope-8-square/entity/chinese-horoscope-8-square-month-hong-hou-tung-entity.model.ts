import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ comment: 'คำนวณหลักเดือน โหงวโฮ่วตุ๋ง' })
export class ChineseHoroscope8SquareMonthHongHouTung {
  @PrimaryColumn({ comment: 'ลำดับเดือน' })
  month_chinese_id: number;

  @PrimaryColumn({ comment: 'หลัก ปีบน จากการคำนวณ' })
  year_above_id: number;

  @Column({ comment: 'หลัก เดือนล่าง' })
  month_below_id: number;

  @Column({ comment: 'หลัก เดือนบน' })
  month_above_id: number;
}
