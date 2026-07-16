import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChineseHoroscope8SquareAbove } from './entity/chinese-horoscope-8-square-above-entity.model';
import { ChineseHoroscope8SquareInput } from './dto/chinese-horoscope-8-square.input';
import { ChineseHoroscope8SquareBelow } from './entity/chinese-horoscope-8-square-below-entity.model';
import { ChineseHoroscope8SquareMonthChinese } from './entity/chinese-horoscope-8-square-month-chinese-entity.model';
import { ChineseHoroscope8SquareMonthHongHouTung } from './entity/chinese-horoscope-8-square-month-hong-hou-tung-entity.model';
import { ChineseHoroscope8SquareCheckMonthChineseInput } from './dto/chinese-horoscope-8-square-check-month-chinese.input';
import { ChineseHoroscope8SquareCheckMonthHongHouTungInput } from './dto/chinese-horoscope-8-square-check-month-hong-hou-tung.input';
import { ChineseHoroscope8SquareGet9FebInput } from './dto/chinese-horoscope-8-square-get-9-feb.input';
import { MomentService } from 'src/utils/MomentService';
import { calculateChineseAge } from 'src/utils/calculate-year';
import { ChineseHoroscope8SquareTimeHongHouTung } from './entity/chinese-horoscope-8-square-time-hong-hou-tung-entity.model';
import { ChineseHoroscopeDetailResponse } from 'src/chinese-horoscope/model/chinese-horoscope-detail-response.model';
import { ChineseHoroscope8SquareAscendant } from './entity/chinese-horoscope-8-square-ascendant-entity.model';
import { ChineseHoroscope8SquareCountingIm } from './entity/chinese-horoscope-8-square-counting-im-entity.model';
import { ChineseHoroscope8SquareHiddenZodiac } from './entity/chinese-horoscope-8-square-hidden-zodiac-entity.model';
import { Calendar100YearService } from 'src/calendar-100-year/calendar-100-year.service';

@Injectable()
export class ChineseHoroscope8SquareService {
  constructor(
    @InjectRepository(ChineseHoroscope8SquareAbove)
    private readonly chineseHoroscope8SquareAboveRepository: Repository<ChineseHoroscope8SquareAbove>,

    @InjectRepository(ChineseHoroscope8SquareBelow)
    private readonly chineseHoroscope8SquareBelowRepository: Repository<ChineseHoroscope8SquareBelow>,

    @InjectRepository(ChineseHoroscope8SquareMonthChinese)
    private readonly chineseHoroscope8SquareMonthChineseRepository: Repository<ChineseHoroscope8SquareMonthChinese>,

    @InjectRepository(ChineseHoroscope8SquareMonthHongHouTung)
    private readonly chineseHoroscope8SquareMonthHongHouTungRepository: Repository<ChineseHoroscope8SquareMonthHongHouTung>,

    @InjectRepository(ChineseHoroscope8SquareTimeHongHouTung)
    private readonly chineseHoroscope8SquareTimeHongHouTungRepository: Repository<ChineseHoroscope8SquareTimeHongHouTung>,

    @InjectRepository(ChineseHoroscope8SquareAscendant)
    private readonly chineseHoroscope8SquareAscendantRepository: Repository<ChineseHoroscope8SquareAscendant>,

    @InjectRepository(ChineseHoroscope8SquareCountingIm)
    private readonly chineseHoroscope8SquareCountingImRepository: Repository<ChineseHoroscope8SquareCountingIm>,

    @InjectRepository(ChineseHoroscope8SquareHiddenZodiac)
    private readonly chineseHoroscope8SquareHiddenZodiacRepository: Repository<ChineseHoroscope8SquareHiddenZodiac>,

    private momentService: MomentService,
    private calendar100YearService: Calendar100YearService,
  ) {}

  async getChineseHoroscope8SquareAbove(
    _input: ChineseHoroscope8SquareInput,
  ): Promise<any> {
    const result = await this.chineseHoroscope8SquareAboveRepository.findOne({
      where: {
        id: _input.id,
      },
    });
    if (result) {
      return {
        id: result.id,
        chinese_symbol: result.chinese_symbol,
        pronunciation: result.pronunciation,
        element: result.element,
        power: result.power,
        direction: result.direction,
        color: result.color,
      } as ChineseHoroscopeDetailResponse;
    }
    return null;
  }

  async getChineseHoroscope8SquareBelow(
    _input: ChineseHoroscope8SquareInput,
  ): Promise<any> {
    const result = await this.chineseHoroscope8SquareBelowRepository.findOne({
      where: {
        id: _input.id,
      },
    });
    if (result) {
      return {
        id: result.id,
        chinese_symbol: result.chinese_symbol,
        pronunciation: result.pronunciation,
        element: result.element,
        power: result.power,
        direction: result.direction,
        color: result.color,
        constellation: result.constellation,
      } as ChineseHoroscopeDetailResponse;
    }
    return null;
  }

  async getChineseHoroscope8MonthChinese(
    _input: ChineseHoroscope8SquareCheckMonthChineseInput,
  ): Promise<any> {
    const whereDate = `${
      _input.month < 10 ? `0${_input.month}` : _input.month
    }-${_input.date < 10 ? `0${_input.date}` : _input.date}`;
    const query =
      this.chineseHoroscope8SquareMonthChineseRepository.createQueryBuilder();
    query.select('month_chinese_id');
    query.addSelect('start_day');
    query.addSelect('start_month');
    query.addSelect('end_day');
    query.addSelect('end_month');
    query.addSelect('start_date');
    query.addSelect('end_date');
    query.addSelect('chinese_horoscope_8_square_below_id');
    query.where(
      `(:start_date BETWEEN start_date AND end_date)
   OR (start_date > end_date AND (:start_date >= start_date OR :start_date <= end_date))`,
      {
        start_date: `${whereDate}`,
      },
    );

    const result = await query.getRawOne();

    if (result) {
      return {
        month_chinese_id: result.month_chinese_id,
        start_day: result.start_day,
        start_month: result.start_month,
        end_day: result.end_day,
        end_month: result.end_month,
        start_date: result.start_date,
        end_date: result.end_date,
        chinese_horoscope_8_square_below_id:
          result.chinese_horoscope_8_square_below_id,
      };
    }
    return null;
  }

  async getChineseHoroscope8MonthChineseById(
    month_chinese_id: number,
  ): Promise<any> {
    console.log(
      'getChineseHoroscope8MonthChineseById : month_chinese_id=' +
        month_chinese_id,
    );
    const query =
      this.chineseHoroscope8SquareMonthChineseRepository.createQueryBuilder();
    query.select('month_chinese_id');
    query.addSelect('start_day');
    query.addSelect('start_month');
    query.addSelect('end_day');
    query.addSelect('end_month');
    query.addSelect('start_date');
    query.addSelect('end_date');
    query.addSelect('chinese_horoscope_8_square_below_id');
    query.where(`month_chinese_id = :month_chinese_id`, {
      month_chinese_id: `${month_chinese_id}`,
    });

    const result = await query.getRawOne();

    if (result) {
      return {
        month_chinese_id: result.month_chinese_id,
        start_day: result.start_day,
        start_month: result.start_month,
        end_day: result.end_day,
        end_month: result.end_month,
        start_date: result.start_date,
        end_date: result.end_date,
        chinese_horoscope_8_square_below_id:
          result.chinese_horoscope_8_square_below_id,
      };
    }
    return null;
  }

  async getChineseHoroscope8MonthHongHouTung(
    _input: ChineseHoroscope8SquareCheckMonthHongHouTungInput,
  ): Promise<any> {
    const result =
      await this.chineseHoroscope8SquareMonthHongHouTungRepository.findOne({
        where: {
          month_chinese_id: _input.month_chinese_index,
          year_above_id: _input.year_above_id,
        },
      });
    if (result) {
      return {
        month_chinese_id: result.month_chinese_id,
        year_above_id: result.year_above_id,
        month_below_id: result.month_below_id,
        month_above_id: result.month_above_id,
      };
    }
    return null;
  }

  async get9FebruaryOfYear(
    _input: ChineseHoroscope8SquareGet9FebInput,
  ): Promise<any> {
    let year = _input.yearTh;
    console.log(`get9FebruaryOfYear : year=${year}`);
    // 1. พศ ลบ 7
    year = year - 7;
    console.log(`get9FebruaryOfYear : year=${year}`);
    // 2. หาร 4 หา เศษ
    let modYear = year % 4;
    console.log(`get9FebruaryOfYear : modYear=${modYear}`);
    // 3. เศษ ข้อ 2. คูณ 5
    modYear = modYear * 5;
    console.log(`get9FebruaryOfYear : modYear=${modYear}`);

    // 4. ตัวตั้ง ถ้ามีเศษ + 1
    const resultFloor = Math.floor(year / 4);
    console.log(`get9FebruaryOfYear : resultFloor=${resultFloor}`);

    // 5. เอาข้อ 4 บวก ข้อ 3
    let total = resultFloor + modYear;
    if (modYear > 0) {
      total = total + 1;
    }
    console.log(`get9FebruaryOfYear : total=${total}`);

    // 6. +Factor
    const factor = await this.getFactorYear(_input.yearTh);
    console.log(
      `get9FebruaryOfYear :  year=[${_input.yearTh}] factor=${factor}`,
    );
    total = total + factor;
    console.log(`get9FebruaryOfYear : total+factor=${total}`);

    // 7. เอา 2 หลักสุดท้าย
    const last2Character =
      total.toString().charAt(total.toString().length - 2) +
      total.toString().charAt(total.toString().length - 1);
    console.log(`get9FebruaryOfYear : last2Character=${last2Character}`);
    const result = parseInt(last2Character);
    // 8. ปี บน หาร 10 เอาเศษ 0 = 10
    const above = result % 10;
    // 9. ปี ล่าง หาร 12 เอาเศษ
    const below = result % 12;

    return {
      last2Character: parseInt(last2Character),
      above: above,
      below: below,
    };
  }

  async getFactorYear(yearTH: number): Promise<number> {
    const mod = yearTH % 12;
    console.log('getFactorYear [' + yearTH + '] =  ' + mod);
    if (mod == 11 || (mod >= 0 && mod <= 2)) {
      return 0;
    }

    if (mod >= 3 && mod <= 6) {
      return 20;
    }

    if (mod >= 7 && mod <= 10) {
      return 40;
    }

    return 0;
  }

  isLeapYear(year) {
    return year % 4 === 0;
  }

  async get9FebruaryOfYearToBirthday(
    year: number,
    feb: string,
    birthdate: string,
  ): Promise<any> {
    console.log(
      `get9FebruaryOfYearToBirthday: feb=${feb}, birthdate=${birthdate}`,
    );
    const startDate = this.momentService.momentDateFromFormat(
      feb,
      'YYYY-MM-DD',
    );
    const endDate = this.momentService.momentDateFromFormat(
      birthdate,
      'YYYY-MM-DD',
    );
    const result = endDate.diff(startDate, 'days');
    console.log(`get9FebruaryOfYearToBirthday: result=${result}`);
    return result;
  }

  async getDifferentDate(start_date: string, end_date: string): Promise<any> {
    console.log(
      `getDifferentDate: start_date=${start_date}, end_date=${end_date}`,
    );
    const startDate = this.momentService.momentDateFromFormat(
      start_date,
      'YYYY-MM-DD',
    );
    const endDate = this.momentService.momentDateFromFormat(
      end_date,
      'YYYY-MM-DD',
    );
    const result = endDate.diff(startDate, 'days');
    console.log(`getDifferentDate: result=${result}`);
    return result;
  }

  async getChineseHoroscope8TimeHongHouTung(
    time: string,
    day_above_id: number,
  ): Promise<any> {
    const query =
      this.chineseHoroscope8SquareTimeHongHouTungRepository.createQueryBuilder();
    query.select('time_chinese_id');
    query.addSelect('start_time');
    query.addSelect('end_time');
    query.addSelect('day_above_id');
    query.addSelect('time_above_id');
    query.addSelect('time_below_id');
    query.where('start_time <= :start_time', {
      start_time: `${time}`,
    });
    query.andWhere('end_time >= :end_time', {
      end_time: `${time}`,
    });
    query.andWhere('day_above_id = :day_above_id', {
      day_above_id: `${day_above_id}`,
    });

    const result = await query.getRawOne();

    if (result) {
      return {
        time_chinese_id: result.time_chinese_id,
        start_time: result.start_time,
        end_time: result.end_time,
        day_above_id: result.day_above_id,
        time_above_id: result.time_above_id,
        time_below_id: result.time_below_id,
        end_date: result.time_below_id,
      };
    }
    return null;
  }

  // ลัคนา
  async getChineseHoroscope8Ascendant(
    yearAbove: any,
    monthBelow: any,
    timeBelow: any,
  ): Promise<any> {
    console.log('getChineseHoroscope8TAscendant:');
    if (monthBelow && timeBelow && yearAbove) {
      const step1 = monthBelow.id + timeBelow.id;
      console.log('step1=' + step1);
      let ascendantBelowId = 0;
      if (step1 < 8) {
        ascendantBelowId = 8 - step1;
      } else if (step1 < 20) {
        ascendantBelowId = 20 - step1;
      } else {
        ascendantBelowId = 32 - step1;
      }

      console.log('ascendantBelowId=' + ascendantBelowId);
      // สารทเล็ก  ต้อง - 1
      // สารทใหญ่
      const ascendantAbove =
        await this.chineseHoroscope8SquareAscendantRepository.findOne({
          where: {
            year_above_id: yearAbove.id,
            ascendant_below_id: ascendantBelowId,
          },
        });
      console.log(ascendantAbove);

      const aboveInfo = await this.getChineseHoroscope8SquareAbove({
        id: ascendantAbove.ascendant_above_id,
      } as ChineseHoroscope8SquareInput);
      const belowInfo = await this.getChineseHoroscope8SquareBelow({
        id: ascendantAbove.ascendant_below_id,
      } as ChineseHoroscope8SquareInput);

      return {
        ascendantAbove: aboveInfo,
        ascendantBelow: belowInfo,
      };
    }

    return null;
  }

  // ลัคนา
  async getChineseHoroscope8AscendantAndDOB(
    yearAbove: any,
    monthBelow: any,
    timeBelow: any,
    year: any,
    month: any,
    date: any,
    time: any,
    yearReal: any,
  ): Promise<any> {
    console.log('getChineseHoroscope8AscendantAndDOB:');
    if (
      monthBelow &&
      timeBelow &&
      yearAbove &&
      year &&
      month &&
      date &&
      time &&
      time != ''
    ) {
      const step1 = monthBelow.id + timeBelow.id;
      console.log('step1=' + step1);
      let ascendantBelowId = 0;
      if (step1 < 8) {
        ascendantBelowId = 8 - step1;
      } else if (step1 < 20) {
        ascendantBelowId = 20 - step1;
      } else {
        ascendantBelowId = 32 - step1;
      }

      console.log('ascendantBelowId=' + ascendantBelowId);
      const resultBigOrSmall =
        await this.calendar100YearService.checkIsBigOrSmallDay(
          year,
          month,
          date,
          time,
          yearReal,
        );
      console.log('resultBigOrSmall:');
      console.log(resultBigOrSmall);
      if (!resultBigOrSmall) {
        return null;
      }

      if (resultBigOrSmall == 'small') {
        ascendantBelowId = ascendantBelowId - 1;
        if (ascendantBelowId < 1) {
          ascendantBelowId = 12;
        }
      }

      const ascendantAbove =
        await this.chineseHoroscope8SquareAscendantRepository.findOne({
          where: {
            year_above_id: yearAbove.id,
            ascendant_below_id: ascendantBelowId,
          },
        });

      const aboveInfo = await this.getChineseHoroscope8SquareAbove({
        id: ascendantAbove.ascendant_above_id,
      } as ChineseHoroscope8SquareInput);
      const belowInfo = await this.getChineseHoroscope8SquareBelow({
        id: ascendantAbove.ascendant_below_id,
      } as ChineseHoroscope8SquareInput);

      return {
        ascendantAbove: aboveInfo,
        ascendantBelow: belowInfo,
      };
    }

    return null;
  }

  // วัยจร
  async getChineseHoroscope8Cycle(
    yearAbove: any,
    monthAbove: any,
    monthBelow: any,
    gender: string,
    year: number,
    month: number,
    date: number,
    time: string,
    realYear: number,
  ): Promise<any> {
    console.log('getChineseHoroscope8Cycle:');
    // STEP 1:
    const isForward = this.isChineseHoroscope8CycleForward(gender, yearAbove);
    console.log('isForward:' + isForward);

    // STEP 2:
    const isUseBigNextDate = isForward;
    console.log('isUseBigNextMonth:' + isUseBigNextDate);

    // STEP 3: BIRTHDAY
    const birthDate = `${year}-${month < 10 ? `0${month}` : month}-${
      date < 10 ? `0${date}` : date
    }`;
    console.log('birthDate:' + birthDate);

    // STEP 4 : FIND BIG OR SMALL
    const bigOrSmallDate = await this.calendar100YearService.getDay(
      year,
      month,
      date,
      time,
      isForward,
    );
    console.log('bigOrSmallDate:');
    console.log(bigOrSmallDate);

    // STEP 5 : DIFF DATE
    const diffDate = this.diffDays(
      {
        year: year,
        month: month,
        date: date,
      },
      bigOrSmallDate,
    );
    console.log('diffDate: ' + diffDate);

    // STEP 6 : divide by 3 = 0 = 0 / 1 = 120 / 2 = 240
    const yearBirth = Math.floor(diffDate / 3);
    const monthBirth = (diffDate % 3) * 120;
    console.log('yearBirth: ' + yearBirth + ' : monthBirth: ' + monthBirth);

    // LOOP : MONTH
    // #chinese-age-offset-fix: age must come from the real Gregorian birth
    // year (realYear), not `year` — which is already lunar-shifted -1 for
    // Jan 1 - Feb 3 births (correct for the zodiac/pillar lookups above,
    // wrong for plain calendar-year age arithmetic).
    const age = calculateChineseAge(
      realYear,
      this.momentService.moment().toDate(),
    );
    let startMonthAboveId = monthAbove.id;
    let startMonthBelowId = monthBelow.id;
    const initStartAgeYear = yearBirth;
    const initEndAgeYear = yearBirth + 4;

    const result = [];
    let ageZodiac = '';
    let ageElement = '';

    // ABOVE
    for (let i = 1; i <= 20; i += 2) {
      const ageAboveStart = initStartAgeYear + (i - 1) * 5;
      const ageAboveEnd = initEndAgeYear + (i - 1) * 5;

      startMonthAboveId = isForward
        ? startMonthAboveId + 1
        : startMonthAboveId - 1;

      if (startMonthAboveId > 10) {
        startMonthAboveId = 1;
      }
      if (startMonthAboveId <= 0) {
        startMonthAboveId = 10;
      }

      console.log(
        `ageAboveStart=${ageAboveStart} : ageAboveEnd=${ageAboveEnd} = ${startMonthAboveId}`,
      );
      console.log(` `);

      const isAge = age >= ageAboveStart && age <= ageAboveEnd;

      const aboveInfo = await this.getChineseHoroscope8SquareAbove({
        id: startMonthAboveId,
      } as ChineseHoroscope8SquareInput);
      if (isAge) {
        ageZodiac = aboveInfo ? aboveInfo.chinese_symbol : '';
        ageElement = aboveInfo ? aboveInfo.element : '';
      }

      result.push({
        ageChinese: ageAboveStart + 1,
        ageStart: ageAboveStart,
        ageEnd: ageAboveEnd,
        isAge: isAge,
        is_above: true,
        element: aboveInfo ? aboveInfo.element : '',
        month_chinese_id: aboveInfo ? aboveInfo.id : '',
        id: aboveInfo ? aboveInfo.chinese_symbol : '',
      });
    }

    // BELOW
    for (let i = 1; i <= 20; i += 2) {
      const ageBelowStart = initStartAgeYear + i * 5;
      const ageBelowEnd = initEndAgeYear + i * 5;

      startMonthBelowId = isForward
        ? startMonthBelowId + 1
        : startMonthBelowId - 1;

      if (startMonthBelowId > 12) {
        startMonthBelowId = 1;
      }
      if (startMonthBelowId <= 0) {
        startMonthBelowId = 12;
      }

      console.log(
        `ageBelowStart=${ageBelowStart} : ageBelowEnd=${ageBelowEnd} = ${startMonthBelowId}`,
      );
      console.log(` `);
      const isAge = age >= ageBelowStart && age <= ageBelowEnd;

      const belowInfo = await this.getChineseHoroscope8SquareBelow({
        id: startMonthBelowId,
      } as ChineseHoroscope8SquareInput);
      if (isAge) {
        ageZodiac = belowInfo ? belowInfo.chinese_symbol : '';
        ageElement = belowInfo ? belowInfo.element : '';
      }
      result.push({
        ageChinese: ageBelowStart + 1,
        ageStart: ageBelowStart,
        ageEnd: ageBelowEnd,
        is_above: false,
        isAge: isAge,
        element: belowInfo ? belowInfo.element : '',
        month_chinese_id: belowInfo ? belowInfo.id : '',
        id: belowInfo ? belowInfo.chinese_symbol : '',
      });
    }

    const sortedData = result.sort((a, b) => a.ageStart - b.ageStart);
    console.log(sortedData);
    return {
      birthdayYear: yearBirth,
      birthdayMonth: monthBirth,
      ageZodiac: ageZodiac,
      ageElement: ageElement,
      age: age,
      life: sortedData,
    };
  }

  // ปีจร
  async getChineseHoroscope8YearCycle(
    yearAbove: any,
    yearBelow: any,
    month: number,
  ): Promise<any> {
    const startYear = month == 1 ? 2 : 1;
    const result: any[] = [];

    let yA = yearAbove.id;
    let yB = yearBelow.id;
    for (let i = startYear; i <= 100; i++) {
      const aboveInfo = await this.getChineseHoroscope8SquareAbove({
        id: yA,
      } as ChineseHoroscope8SquareInput);
      const belowInfo = await this.getChineseHoroscope8SquareBelow({
        id: yB,
      } as ChineseHoroscope8SquareInput);
      result.push({
        year: i,
        yearAbove: aboveInfo,
        yearBelow: belowInfo,
      });
      ++yA;
      ++yB;

      if (yA > 10) {
        yA = 1;
      }

      if (yB > 12) {
        yB = 1;
      }
    }

    return result;
  }

  diffDays(
    date1: { year: number; month: number; date: number },
    date2: { year: number; month: number; date: number },
  ): number {
    const d1Str = `${date1.year}-${String(date1.month).padStart(
      2,
      '0',
    )}-${String(date1.date).padStart(2, '0')}`;
    const d2Str = `${date2.year}-${String(date2.month).padStart(
      2,
      '0',
    )}-${String(date2.date).padStart(2, '0')}`;

    const d1 = this.momentService.momentDateFromFormat(d1Str, 'YYYY-MM-DD');
    const d2 = this.momentService.momentDateFromFormat(d2Str, 'YYYY-MM-DD');

    return Math.abs(d1.diff(d2, 'days'));
  }

  isChineseHoroscope8CycleForward(gender: string, yearAbove: any): boolean {
    const year = yearAbove.id;
    console.log('isChineseHoroscope8CycleForward = year: ' + year);
    if (gender == 'MALE') {
      if (year == 1 || year == 3 || year == 5 || year == 7 || year == 9) {
        return true; // Forward & Next Bigger
      } else {
        return false; // Prev & Current Bigger
      }
    } else if (gender == 'FEMALE') {
      if (year == 1 || year == 3 || year == 5 || year == 7 || year == 9) {
        return false; // Prev & Current Bigger
      } else {
        return true; // Forward & Next Bigger
      }
    }
    return true;
  }

  // นับอิม
  async getChineseHoroscope8CountingIm(
    above_id: any,
    below_id: any,
  ): Promise<any> {
    console.log('getChineseHoroscope8CountingIm:');
    if (above_id && below_id) {
      const result =
        await this.chineseHoroscope8SquareCountingImRepository.findOne({
          where: {
            above_id: above_id,
            below_id: below_id,
          },
        });

      if (result) {
        console.log(result);
        return result;
      }
    }

    return null;
  }

  // ราศีแฝง
  async getChineseHoroscope8HiddenZodiac(below_id: any): Promise<any> {
    console.log('getChineseHoroscope8HiddenZodiac:');
    if (below_id) {
      const result =
        await this.chineseHoroscope8SquareHiddenZodiacRepository.findOne({
          where: {
            below_id: below_id,
          },
        });

      if (result) {
        console.log(result);
        return result;
      }
    }

    return null;
  }

  // ปีจร
  async getChineseHoroscope8YearOfZodiac(): Promise<any> {
    console.log('getChineseHoroscope8YearOfZodiac:');
    const yearTH = parseInt(this.momentService.moment().format('YYYY')) + 543;
    let above = yearTH % 10;
    let below = yearTH % 12;
    console.log(
      'getChineseHoroscope8YearOfZodiac:[yearTH=' +
        yearTH +
        '] above= ' +
        above +
        ': below=' +
        below,
    );
    above = above + 4;
    if (above > 10) {
      above = above - 10;
    }

    below = below + 6;
    if (below > 12) {
      below = below - 12;
    }

    console.log(
      'getChineseHoroscope8YearOfZodiac: above= ' + above + ': below=' + below,
    );

    const aboveInfo = await this.getChineseHoroscope8SquareAbove({
      id: above,
    } as ChineseHoroscope8SquareInput);
    const belowInfo = await this.getChineseHoroscope8SquareBelow({
      id: below,
    } as ChineseHoroscope8SquareInput);

    return {
      above: aboveInfo ? aboveInfo?.chinese_symbol : '',
      below: belowInfo ? belowInfo?.chinese_symbol : '',
      aboveElement: aboveInfo ? aboveInfo?.element : '',
      belowElement: belowInfo ? belowInfo?.element : '',
    };
  }
}
