import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ comment: 'ปฏิทินจีน' })
export class ChineseCalendar {
  @PrimaryColumn()
  day: number;

  @PrimaryColumn()
  month: number;

  @PrimaryColumn()
  year: number;

  @Column({ default: false, comment: 'วันพระไทย' })
  is_thai_buddhist_day: boolean;

  @Column({ default: false, comment: 'วันพระจีน' })
  is_chinese_buddhist_day: boolean;

  @Column({ type: 'text', comment: 'รหัสความหมายเวลามงคล' })
  chinese_time_codes: string;

  @Column({ type: 'text', comment: 'ช่วงเวลามงคล' })
  chinese_time_ranges: string;

  @Column({ comment: 'สิ่งศักดื์สิทธิ์' })
  scared_thing: string;

  @Column({ comment: 'สีมงคล' })
  color_1: string;

  @Column({ comment: 'สีมงคล' })
  color_2: string;

  @Column({ comment: 'ทิศโชคลาภ' })
  direction_good: string;

  @Column({ comment: 'ทิศอสูรวัน' })
  direction_bad: string;

  @Column({ default: false, comment: 'วันหมอเทพ' })
  is_doctor_day: boolean;

  @Column({ default: false, comment: 'วันมงคล' })
  is_good_day: boolean;

  @Column({ default: false, comment: 'วันเทียนไช้' })
  is_thian_chai: boolean;

  @Column({ comment: 'code คำอธิบาย' })
  desc_1: string;

  @Column({ comment: 'code คำอธิบาย' })
  desc_2: string;

  @PrimaryColumn({ type: 'float', comment: 'เปอร์เซ็นต์มงคล' })
  percentage: number;

  @PrimaryColumn({ comment: 'อักษรจีนบน' })
  above_1: number;

  @PrimaryColumn({ comment: 'อักษรจีนบน' })
  above_2: number;

  @PrimaryColumn({ comment: 'อักษรจีนบน' })
  above_3: number;

  @PrimaryColumn({ comment: 'อักษรจีนล่าง' })
  below_1: number;

  @PrimaryColumn({ comment: 'อักษรจีนล่าง' })
  below_2: number;

  @PrimaryColumn({ comment: 'อักษรจีนล่าง' })
  below_3: number;

  @Column({ comment: 'เวลาเปลี่ยนสารท' })
  time_change: string;
}
