import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ChineseCalendarService } from 'src/chineses-calendar/chinese-calendar.service';
import { ChineseCalendarGetDairyInput } from 'src/chineses-calendar/dto/chinese-calendar-get-diary.input';
import { PaymentPlan } from 'src/constants/payment-plan';
import { LineMessageService } from 'src/line-message/line-message.service';
import { MemberPaymentGetAvailableInput } from 'src/member-payment/dto/member-payment-get-available.input';
import { MemberPaymentService } from 'src/member-payment/member-payment.service';
import { MomentService } from 'src/utils/MomentService';
import { LessThan } from 'typeorm';

@Injectable()
export class CronjobService {
  private readonly logger = new Logger(CronjobService.name);

  constructor(
    private readonly lineMessageService: LineMessageService,
    private readonly memberPaymentService: MemberPaymentService,
    private readonly chineseCalendarService: ChineseCalendarService,
    private readonly momentWrapper: MomentService,
  ) {}

  generateMessage = (
    day: number,
    month: number,
    year: number,
    is_thai_buddhist_day: boolean,
    is_chinese_buddhist_day: boolean,
    direction_good: any,
    direction_bad: any,
    is_good_day: boolean,
    scared_thing: any,
    colors: any[],
  ) => {
    const thaiMonths = [
      '',
      'มกราคม',
      'กุมภาพันธ์',
      'มีนาคม',
      'เมษายน',
      'พฤษภาคม',
      'มิถุนายน',
      'กรกฎาคม',
      'สิงหาคม',
      'กันยายน',
      'ตุลาคม',
      'พฤศจิกายน',
      'ธันวาคม',
    ];

    const thaiDays = [
      'อาทิตย์',
      'จันทร์',
      'อังคาร',
      'พุธ',
      'พฤหัสบดี',
      'ศุกร์',
      'เสาร์',
    ];

    const date = new Date(`${year}-${month}-${day}T00:00:00+07:00`);
    const dayOfWeek = thaiDays[date.getDay()];
    const yearBE = year + 543;

    let message = `สวัสดีตอนเช้า 🌤️\n`;
    message += `วันที่ ${day} ${thaiMonths[month]} ${yearBE}\n\n`;

    // ✨ วันมงคล
    console.log('is_good_day', is_good_day);
    if (is_good_day + '' == 'true') {
      console.log('is_good_day treu', is_good_day);
      message += `วันนี้เป็นวันมงคล ✨\n\n`;
    }

    // 🧘 วันพระ
    if (is_thai_buddhist_day && is_chinese_buddhist_day) {
      message += `วันนี้เป็นวันพระไทย และจีน 🙏\n`;
    } else if (is_thai_buddhist_day) {
      message += `วันนี้เป็นวันพระไทย 🙏\n`;
    } else if (is_chinese_buddhist_day) {
      message += `วันนี้เป็นวันพระจีน 🙏\n`;
    }

    // 🔱 เทพประจำวัน
    if (scared_thing) {
      message += `เทพประจำวัน คือ\n${scared_thing.name} 🔱\n\n`;
    }

    // 🌅 ทิศมงคล
    if (direction_good) {
      message += `ทิศมงคล คือ ${direction_good.description} 🌤️\n`;
    }

    // 🔥 ทิศอสูรวัน
    if (direction_bad) {
      message += `ทิศอสูรวัน คือ ${direction_bad.description} ⚠️\n\n`;
    }

    // 🎨 สีมงคล
    if (colors && colors.length >= 3) {
      const colorNames = colors.map((c) => c.name).join(' ');
      message += `สีมงคลวันนี้ คือ\n${colorNames} 🎨\n`;
    }

    return message.trim();
  };
  // @Cron('0 0 8 * * *', { timeZone: 'Asia/Bangkok' })
  @Cron('0 0 6 * * *', { timeZone: 'Asia/Bangkok' })
  async sendMorningNotification() {
    this.logger.log('Running 08:00 LINE notification cron...');

    const day = parseInt(this.momentWrapper.moment().format('DD'));
    const month = parseInt(this.momentWrapper.moment().format('MM'));
    const year = parseInt(this.momentWrapper.moment().format('YYYY'));

    const calendarInfo = await this.chineseCalendarService.getCalendarDairy({
      user_id: null,
      day: day,
      month: month,
      year: year,
    } as ChineseCalendarGetDairyInput);

    console.log('calendarInfo:', calendarInfo);

    if (!calendarInfo) {
      return;
    }

    const message = this.generateMessage(
      day,
      month,
      year,
      calendarInfo.result.is_thai_buddhist_day,
      calendarInfo.result.is_chinese_buddhist_day,
      calendarInfo.direction_good,
      calendarInfo.direction_bad,
      calendarInfo.result.is_good_day,
      calendarInfo.scared_thing,
      calendarInfo.colors,
    );
    console.log('message', message);

    const userLists = await this.memberPaymentService.getMemberPaymentAvailable(
      {
        plan_code: PaymentPlan.MEMBER,
      } as MemberPaymentGetAvailableInput,
    );
    // console.log('userLists:', userLists);

    const userIds: any[] = [];
    for (let i = 0; i < userLists.length; i++) {
      const user = userLists[i];
      userIds.push(user.user_provider_id_token);
    }

    // console.log(userIds);

    // const userIds = ['U31a1a0aeafc7d4f654205ee8fb265053'];

    if (!userIds.length) {
      this.logger.log('No users to send');
      return;
    }

    console.log('userIds:', userIds.length);

    try {
      await this.lineMessageService.multicastText(userIds, message);

      this.logger.log('LINE sent successfully');
    } catch (error) {
      this.logger.error('LINE send failed', error);
    }
  }
  // 9 8
  @Cron('0 0 9 * * *', { timeZone: 'Asia/Bangkok' })
  async sendMorningNotificationFree() {
    this.logger.log('Running 08:00 LINE notification cron...');

    const day = parseInt(this.momentWrapper.moment().format('DD'));
    const month = parseInt(this.momentWrapper.moment().format('MM'));
    const year = parseInt(this.momentWrapper.moment().format('YYYY'));

    const calendarInfo = await this.chineseCalendarService.getCalendarDairy({
      user_id: null,
      day: day,
      month: month,
      year: year,
    } as ChineseCalendarGetDairyInput);

    console.log('calendarInfo:', calendarInfo);

    if (!calendarInfo) {
      return;
    }

    let message = this.generateMessage(
      day,
      month,
      year,
      calendarInfo.result.is_thai_buddhist_day,
      calendarInfo.result.is_chinese_buddhist_day,
      calendarInfo.direction_good,
      calendarInfo.direction_bad,
      calendarInfo.result.is_good_day,
      calendarInfo.scared_thing,
      calendarInfo.colors,
    );

    message += `\n
────────────────

📩 สมัครสมาชิกรายเดือน รายปี เพื่อรับดวงประจำวันแบบละเอียดทุกเช้า
พร้อมคำแนะนำเฉพาะตัว ส่งตรงถึง LINE ของคุณ
`;

    console.log('message', message);

    //const userIds = ['U31a1a0aeafc7d4f654205ee8fb265053'];

    const userLists = await this.memberPaymentService.getMemberPaymentFree(3);
    // console.log('userLists:', userLists);

    const userIds: any[] = [];
    for (let i = 0; i < userLists.length; i++) {
      const user = userLists[i];
      userIds.push(user.user_provider_id_token);
    }

    const userMembers =
      await this.memberPaymentService.getMemberPaymentAvailable({
        plan_code: PaymentPlan.MEMBER,
      } as MemberPaymentGetAvailableInput);
    // console.log('userMembers:', userMembers);

    const userListsMember: any[] = [];
    for (let i = 0; i < userMembers.length; i++) {
      const user = userMembers[i];
      userListsMember.push(user.user_provider_id_token);
    } // ✅ ตรวจสอบ LINE userId (ขึ้นต้นด้วย U + 32 hex)
    const isLineUserId = (value: unknown): value is string => {
      return typeof value === 'string' && /^U[a-f0-9]{32}$/i.test(value.trim());
    };

    // 1️⃣ รวมก่อน
    // 1️⃣ Normalize userListsMember ก่อน (trim + filter)
    const memberSet = new Set(
      userListsMember
        .map((id) => (typeof id === 'string' ? id.trim() : ''))
        .filter(isLineUserId),
    );

    // 2️⃣ Clean userIds + filter + remove คนที่อยู่ใน memberSet
    const mergedUnique = Array.from(
      new Set(
        userIds
          .map((id) => (typeof id === 'string' ? id.trim() : ''))
          .filter((id) => isLineUserId(id) && !memberSet.has(id)),
      ),
    );

    console.log('userIds', userIds.length);
    console.log('userListsMember', userListsMember.length);
    console.log('mergedUnique', mergedUnique.length);

    if (!mergedUnique.length) {
      this.logger.log('No users to send');
      return;
    }

    console.log('mergedUnique:', mergedUnique.length);
    try {
      await this.lineMessageService.multicastText(mergedUnique, message);

      this.logger.log('LINE sent successfully');
    } catch (error) {
      this.logger.error('LINE send failed', error);
    }
  }
}
