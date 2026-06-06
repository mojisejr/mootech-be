import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ comment: 'ตาราง วันเปลี่ยนสารท' })
export class Calendar100Year {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: 'ปี ค.ศ. เริ่มต้น' })
  start_year: number;

  @Column({ comment: '' })
  start_month: number;

  @Column({ comment: '' })
  start_date: number;

  @Column({ comment: '' })
  start_time: string;

  @Column({ comment: 'ปี ค.ศ. สิ้นสุด' })
  end_year: number;

  @Column({ comment: '' })
  end_month: number;

  @Column({ comment: '' })
  end_date: number;

  @Column({ comment: '' })
  end_time: string;

  @Column({ comment: 'วันสารทใหญ่ ปี ค.ศ. เริ่มต้น' })
  big_start_year: number;

  @Column({ comment: '' })
  big_start_month: number;

  @Column({ comment: '' })
  big_start_date: number;

  @Column({ comment: '' })
  big_start_time: string;

  @Column({ comment: 'วันสารทใหญ่ ปี ค.ศ. สิ้นสุด' })
  big_end_year: number;

  @Column({ comment: '' })
  big_end_month: number;

  @Column({ comment: '' })
  big_end_date: number;

  @Column({ comment: '' })
  big_end_time: string;

  @Column({ comment: 'วันสารรทเล็ก ปี ค.ศ. เริ่มต้น' })
  small_start_year: number;

  @Column({ comment: '' })
  small_start_month: number;

  @Column({ comment: '' })
  small_start_date: number;

  @Column({ comment: '' })
  small_start_time: string;

  @Column({ comment: 'วันสารรทเล็ก ปี ค.ศ. สิ้นสุด' })
  small_end_year: number;

  @Column({ comment: '' })
  small_end_month: number;

  @Column({ comment: '' })
  small_end_date: number;

  @Column({ comment: '' })
  small_end_time: string;
}
