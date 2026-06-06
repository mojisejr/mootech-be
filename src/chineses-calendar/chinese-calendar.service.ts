import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MomentService } from 'src/utils/MomentService';
import { ChineseCalendar } from './entity/chinese-calendar-entity.model';
import { ChineseCalendarGetDairyInput } from './dto/chinese-calendar-get-diary.input';
import { ChineseCalendarGetMonthInput } from './dto/chinese-calendar-get-month.input';
import { ScaredThingService } from 'src/scared-thing/scared-thing.service';
import { AnalyticColorService } from 'src/analytic-color/analytic-color.service';
import { ColorService } from 'src/color/color.service';
import { DirectionService } from 'src/direction/direction.service';
import { HolidayService } from 'src/holiday/holiday.service';
import { MemberPaymentService } from 'src/member-payment/member-payment.service';
import { MemberPaymentGetInput } from 'src/member-payment/dto/member-payment-get.input';
import {
  AI_CODE_RESPONSE,
  AI_CODE_RESPONSE_MESSAGE,
} from 'src/constants/ai-code-response';
import { PaymentPlan } from 'src/constants/payment-plan';

@Injectable()
export class ChineseCalendarService {
  constructor(
    @InjectRepository(ChineseCalendar)
    private readonly chineseCalendarRepository: Repository<ChineseCalendar>,
    private scaredThingService: ScaredThingService,
    private analyticColorService: AnalyticColorService,
    private colorService: ColorService,
    private directionService: DirectionService,
    private holidayService: HolidayService,
    private momentWrapper: MomentService,
    private memberPaymentService: MemberPaymentService,
  ) {}

  async isCheckUsage(user_id: string): Promise<any> {
    // CHECK
    const userInfo = await this.memberPaymentService.getMemberPayment({
      user_id: user_id,
    } as MemberPaymentGetInput);
    // NO PAYMENT = FREE
    // NO MEMBER = FREE
    let isFree = false;
    let code = AI_CODE_RESPONSE.SUCCESS;
    let codeDesc = AI_CODE_RESPONSE_MESSAGE.SUCCESS;
    if (!userInfo || !(userInfo.plan_code == PaymentPlan.MEMBER)) {
      isFree = true;
      code = AI_CODE_RESPONSE.NO_PLAN;
      codeDesc = AI_CODE_RESPONSE_MESSAGE.NO_PLAN;
    } else {
      // EXPIRED = FREE
      if (!this.isNotExpired(userInfo.expire_at)) {
        isFree = true;
        code = AI_CODE_RESPONSE.EXPIRED;
        codeDesc = AI_CODE_RESPONSE_MESSAGE.EXPIRED;
      }
    }

    return {
      code: code,
      message: codeDesc,
      is_free: isFree,
    };
  }

  async getCalendarDairy(_input: ChineseCalendarGetDairyInput): Promise<any> {
    let isAllow = true;
    if (_input.user_id != null) {
      const responseCheck: any = await this.isCheckUsage(_input.user_id);
      console.log(responseCheck);

      if (responseCheck && responseCheck.code != AI_CODE_RESPONSE.SUCCESS) {
        isAllow = false;
      }
    }

    const result = await this.chineseCalendarRepository.findOne({
      where: {
        day: _input.day,
        month: _input.month,
        year: _input.year,
      },
    });

    console.log(result);
    let scaredThingInfo = null;
    if (result) {
      const scaredThing = await this.scaredThingService.getScaredThingByCode(
        result.scared_thing,
      );

      console.log(scaredThing);
      scaredThingInfo = scaredThing;
    }

    const colors: any[] = [];

    if (result?.color_1) {
      const color = await this.analyticColorService.getAnalyticByElement(
        result.color_1,
        'STRONG',
      );

      const colorsCodes = await this.colorService.getColor({
        code: JSON.parse(color.note),
      });

      colors.push(...colorsCodes);
    }

    if (result?.color_2) {
      const color = await this.analyticColorService.getAnalyticByElement(
        result.color_2,
        'STRONG',
      );

      const colorsCodes = await this.colorService.getColor({
        code: JSON.parse(color.note),
      });

      colors.push(...colorsCodes);
    }

    let directionGood = null;
    let directionBad = null;
    if (result?.direction_good) {
      directionGood = await this.directionService.getDirection(
        result.direction_good,
      );
    }
    if (result?.direction_bad) {
      directionBad = await this.directionService.getDirection(
        result.direction_bad,
      );
    }

    return {
      is_allow: isAllow,
      result,
      scared_thing: scaredThingInfo,
      colors: colors,
      direction_good: directionGood,
      direction_bad: directionBad,
    };
  }

  async getCalendarMonth(_input: ChineseCalendarGetMonthInput): Promise<any> {
    let isAllow = true;
    if (_input.user_id != null) {
      const responseCheck: any = await this.isCheckUsage(_input.user_id);

      if (responseCheck && responseCheck.code != AI_CODE_RESPONSE.SUCCESS) {
        isAllow = false;
      }
    }

    const result = await this.chineseCalendarRepository.find({
      where: {
        month: _input.month,
        year: _input.year,
      },
      order: {
        day: 'ASC',
      },
    });

    const calendars: any[] = [];
    for (let i = 0; i < result.length; i++) {
      const raw = result[i];
      calendars.push({
        day: raw.day,
        month: raw.month,
        year: raw.year,
        is_thai_buddhist_day: raw.is_thai_buddhist_day,
        is_chinese_buddhist_day: raw.is_chinese_buddhist_day,
        is_doctor_day: raw.is_doctor_day,
        is_good_day: raw.is_good_day,
        is_thian_chai: raw.is_thian_chai,
      });
    }

    const groups = this.groupByFlags(calendars);

    const holidays = await this.holidayService.getHoliday(
      _input.month,
      _input.year,
    );

    return {
      is_allow: isAllow,
      calendars: calendars,
      groups: groups,
      holidays: holidays,
    };
  }

  groupByFlags(data: any[]) {
    const result = {
      is_thai_buddhist_day: [] as number[],
      is_chinese_buddhist_day: [] as number[],
      is_doctor_day: [] as number[],
      is_good_day: [] as number[],
      is_thian_chai: [] as number[],
    };

    data.forEach((d) => {
      if (d.is_thai_buddhist_day) result.is_thai_buddhist_day.push(d.day);
      if (d.is_chinese_buddhist_day) result.is_chinese_buddhist_day.push(d.day);
      if (d.is_doctor_day) result.is_doctor_day.push(d.day);
      if (d.is_good_day) result.is_good_day.push(d.day);
      if (d.is_thian_chai) result.is_thian_chai.push(d.day);
    });

    return result;
  }

  isNotExpired(expired: string): boolean {
    const expiredDate = this.momentWrapper.momentFromDate(expired);

    if (!expiredDate.isValid()) {
      console.log('INVALID expired:', expired);
      return false; // หรือ throw error ตามที่คุณต้องการ
    }

    const expiredDay = expiredDate.startOf('day');
    const today = this.momentWrapper.moment().startOf('day');

    console.log('expired:', expired);
    console.log('expiredDay:', expiredDay.format());
    console.log('today:', today.format());

    return today.isSameOrBefore(expiredDay);
  }
}
