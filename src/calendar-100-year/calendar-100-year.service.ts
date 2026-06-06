import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Calendar100Year } from './entity/calendar-100-year-entity.model';
import { MomentService } from 'src/utils/MomentService';

@Injectable()
export class Calendar100YearService {
  constructor(
    @InjectRepository(Calendar100Year)
    private readonly calendar100YearRepository: Repository<Calendar100Year>,
    private momentService: MomentService,
  ) {}

  async checkIsBigOrSmallDay(
    yearCH: number,
    month: number,
    date: number,
    time: string, // เช่น "13:59"
    yearEN: number,
  ): Promise<'big' | 'small' | null> {
    const year = yearEN;
    const inputDate = this.momentService.momentDateFromFormat(
      `${year}-${month}-${date} ${time}`,
      'YYYY-M-D HH:mm',
    );
    const calendarList = await this.calendar100YearRepository.find();

    for (const item of calendarList) {
      console.log(
        'checkIsBigOrSmallDay input: ' + `${year}-${month}-${date} ${time}`,
      );
      console.log('checkIsBigOrSmallDay: ' + inputDate);
      const bigStart = this.momentService.momentDateFromFormat(
        `${item.big_start_year}-${item.big_start_month}-${item.big_start_date} ${item.big_start_time}`,
        'YYYY-M-D HH:mm',
      );
      const bigEnd = this.momentService.momentDateFromFormat(
        `${item.big_end_year}-${item.big_end_month}-${item.big_end_date} ${item.big_end_time}`,
        'YYYY-M-D HH:mm',
      );
      console.log(
        'item.big_start_year: ' +
          `${item.big_start_year}-${item.big_start_month}-${item.big_start_date} ${item.big_start_time}`,
      );
      console.log(
        'item.big_end_year: ' +
          `${item.big_end_year}-${item.big_end_month}-${item.big_end_date} ${item.big_end_time}`,
      );
      console.log('bigStart: ' + bigStart);
      console.log('bigEnd: ' + bigEnd);

      if (inputDate.isBetween(bigStart, bigEnd, null, '[]')) {
        return 'big';
      }

      const smallStart = this.momentService.momentDateFromFormat(
        `${item.small_start_year}-${item.small_start_month}-${item.small_start_date} ${item.small_start_time}`,
        'YYYY-M-D HH:mm',
      );
      const smallEnd = this.momentService.momentDateFromFormat(
        `${item.small_end_year}-${item.small_end_month}-${item.small_end_date} ${item.small_end_time}`,
        'YYYY-M-D HH:mm',
      );
      console.log(
        'item.small_start_year: ' +
          `${item.small_start_year}-${item.small_start_month}-${item.small_start_date} ${item.small_start_time}`,
      );
      console.log(
        'item.small_end_year: ' +
          `${item.small_end_year}-${item.small_end_month}-${item.small_end_date} ${item.small_end_time}`,
      );
      console.log('smallStart: ' + smallStart);
      console.log('smallEnd: ' + smallEnd);

      if (inputDate.isBetween(smallStart, smallEnd, null, '[]')) {
        return 'small';
      }
    }

    return null;
  }

  async getDay(
    year: number,
    month: number,
    date: number,
    time: string, // เช่น "13:59"
    is_big: boolean,
  ): Promise<any> {
    const targetDateTime = this.momentService.momentDateFromFormat(
      `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(
        2,
        '0',
      )} ${time}`,
      'YYYY-MM-DD HH:mm',
    );

    // 1. ค้นหาว่าช่วงเวลาอยู่ในแถวไหน
    const rows = await this.calendar100YearRepository.find();

    const currentRowIndex = rows.findIndex((row) => {
      const start = this.momentService.momentDateFromFormat(
        `${row.start_year}-${String(row.start_month).padStart(2, '0')}-${String(
          row.start_date,
        ).padStart(2, '0')} ${row.start_time}`,
        'YYYY-MM-DD HH:mm',
      );
      const end = this.momentService.momentDateFromFormat(
        `${row.end_year}-${String(row.end_month).padStart(2, '0')}-${String(
          row.end_date,
        ).padStart(2, '0')} ${row.end_time}`,
        'YYYY-MM-DD HH:mm',
      );
      return targetDateTime.isBetween(start, end, undefined, '[]');
    });

    if (currentRowIndex === -1) return null;

    const targetRow = is_big
      ? rows[currentRowIndex + 1] // แถวถัดไป
      : rows[currentRowIndex]; // แถวปัจจุบัน

    if (!targetRow) return null;

    // คืนข้อมูล big_start ตามแถวที่เลือก
    return {
      year: targetRow.big_start_year,
      month: targetRow.big_start_month,
      date: targetRow.big_start_date,
      time: targetRow.big_start_time,
    };
  }
}
