import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { FortuneTelling } from './entity/fortune-telling-entity.model';
import { FortuneTellingLog } from './entity/fortune-telling-log-entity.model';
import { MomentService } from 'src/utils/MomentService';
import { MemberPaymentService } from 'src/member-payment/member-payment.service';
import { MemberPaymentGetInput } from 'src/member-payment/dto/member-payment-get.input';
import {
  AI_CODE_RESPONSE,
  AI_CODE_RESPONSE_MESSAGE,
} from 'src/constants/ai-code-response';
import { PaymentPlan } from 'src/constants/payment-plan';
import { FORTUNE_LIMIT } from 'src/constants/fortune-limit';
import { FortuneTellingGetInput } from './dto/fortune-telling-get.input';

@Injectable()
export class FortuneTellingService {
  constructor(
    @InjectRepository(FortuneTelling)
    private readonly fortuneTellingRepository: Repository<FortuneTelling>,
    @InjectRepository(FortuneTellingLog)
    private readonly fortuneTellingLogRepository: Repository<FortuneTellingLog>,
    private memberPaymentService: MemberPaymentService,
    private momentWrapper: MomentService,
  ) {}

  getLimit = (is_free: boolean): number => {
    return is_free ? FORTUNE_LIMIT.FREE : null;
  };

  async isCheckUsage(user_id: string, limit_free: number): Promise<any> {
    // CHECK
    const userInfo = await this.memberPaymentService.getMemberPayment({
      user_id: user_id,
    } as MemberPaymentGetInput);
    console.log('isCheckUsage userInfo:', userInfo);
    // NO PAYMENT = FREE
    // NO MEMBER = FREE
    let isFree = false;
    let code = AI_CODE_RESPONSE.SUCCESS;
    let codeDesc = AI_CODE_RESPONSE_MESSAGE.SUCCESS;
    if (!userInfo || !(userInfo.plan_code == PaymentPlan.MEMBER)) {
      isFree = true;
      // code = AI_CODE_RESPONSE.NO_PLAN;
      // codeDesc = AI_CODE_RESPONSE_MESSAGE.NO_PLAN;
    } else {
      // EXPIRED = FREE
      if (!this.isNotExpired(userInfo.expire_at)) {
        isFree = true;
        // code = AI_CODE_RESPONSE.EXPIRED;
        // codeDesc = AI_CODE_RESPONSE_MESSAGE.EXPIRED;
      }
    }

    // CHECK LIMIT
    let limitation = limit_free;
    if (isFree == true) {
      limitation = limit_free;
    }

    const startOfDay = this.momentWrapper
      .moment()
      .startOf('month')
      .format('YYYY-MM-DD 00:00:00');
    const endOfDay = this.momentWrapper
      .moment()
      .endOf('month')
      .format('YYYY-MM-DD 23:59:59');
    const totalAi = await this.fortuneTellingLogRepository.count({
      where: {
        user_id: user_id,
        create_at: Between(startOfDay, endOfDay),
      },
    });
    console.log('limitation:', limitation, 'totalAi:', totalAi);
    if (isFree) {
      if (totalAi >= limitation) {
        code = AI_CODE_RESPONSE.OUT_OF_LIMIT;
        codeDesc = AI_CODE_RESPONSE_MESSAGE.OUT_OF_LIMIT;
      }
    }

    console.log('code:', code, 'message:', codeDesc, 'isFree:', isFree);
    return {
      code: code,
      message: codeDesc,
      is_free: isFree,
    };
  }

  async getFortuneStick(_input: FortuneTellingGetInput): Promise<any> {
    let isRunAi = true;
    const responseCheck: any = await this.isCheckUsage(
      _input.user_id,
      FORTUNE_LIMIT.FREE,
    );
    console.log('responseCheck:', responseCheck);
    if (responseCheck && responseCheck.code != AI_CODE_RESPONSE.SUCCESS) {
      isRunAi = false;
      throw new HttpException(
        {
          code: responseCheck.code,
          message: responseCheck.message,
          error: 'Error',
        },
        HttpStatus.GONE,
      );
    } else {
      isRunAi = true;
    }
    if (isRunAi) {
      const mascots = await this.fortuneTellingRepository.find({
        order: {
          no: 'ASC',
        },
      });
      const randomMascot = mascots[Math.floor(Math.random() * mascots.length)];

      const createAt = this.momentWrapper
        .moment()
        .format('YYYY-MM-DD HH:mm:ss');
      const entity = new FortuneTellingLog();
      entity.create_at = createAt;
      entity.card_no = randomMascot.no;
      entity.user_id = _input.user_id;
      await this.fortuneTellingLogRepository.save(entity);
      return randomMascot;
    }
  }

  async getFortuneStickTotal(userId: string): Promise<any> {
    const result = await this.fortuneTellingLogRepository.count({
      where: {
        user_id: userId,
      },
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
