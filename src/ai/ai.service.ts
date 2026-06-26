import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MomentService } from 'src/utils/MomentService';
import { AiChatFortuneStickInput } from './dto/ai-chat-fortune-stick.input';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios from 'axios';
import { MemberPaymentService } from 'src/member-payment/member-payment.service';
import { MemberPaymentGetInput } from 'src/member-payment/dto/member-payment-get.input';
import { AiChatInput } from './dto/ai-chat.input';
import { UserService } from 'src/user/user.service';
import { LogCalculateService } from 'src/log-calculate/log-calculate.service';
import { PaymentPlan } from 'src/constants/payment-plan';
import { Response } from 'express';
import { LogAI } from './entity/log-ai-entity.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { AI_CHAT_LIMIT } from 'src/constants/ai-limit';
import {
  AI_CODE_RESPONSE,
  AI_CODE_RESPONSE_MESSAGE,
} from 'src/constants/ai-code-response';
import { FEATURE_TYPE } from 'src/constants/feature-type';
import { MemberPayAsUseService } from 'src/member-pay-as-use/member-pay-as-use.service';
import {
  computeMigratedBalance,
  isCreditEnforced,
} from 'src/member-pay-as-use/wallet.util';

@Injectable()
export class AiService {
  constructor(
    @InjectRepository(LogAI)
    private readonly logAIRepository: Repository<LogAI>,
    private userService: UserService,
    private logCalculateService: LogCalculateService,
    private memberPaymentService: MemberPaymentService,
    private memberPayAsUseService: MemberPayAsUseService,
    private momentWrapper: MomentService,
    private readonly httpService: HttpService,
  ) {}
  async saveToLog(
    user_id: string,
    message: string,
    ai_type: string,
  ): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');

    const logs = new LogAI();
    logs.create_at = createAt;
    logs.message = message;
    logs.ai_type = ai_type;
    logs.user_id = user_id;

    await this.logAIRepository.save(logs);
  }

  async isCheckUsage(
    user_id: string,
    limit_free: number,
    limit_member: number,
    ai_type: string,
  ): Promise<any> {
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

    if (isFree) {
      // CHECK TOP UP
      const memberPayPerUse =
        await this.memberPayAsUseService.getMemberPayAsUse(user_id);
      if (memberPayPerUse) {
        limit_free = memberPayPerUse.total + 1;
      }
    }

    // CHECK LIMIT
    let limitation = limit_free;
    if (isFree == true) {
      limitation = limit_free;
    }

    // if (code == AI_CODE_RESPONSE.SUCCESS) {
    const startOfDay = this.momentWrapper
      .moment()
      .startOf('year')
      .format('YYYY-MM-DD 00:00:00');
    const endOfDay = this.momentWrapper
      .moment()
      .endOf('year')
      .format('YYYY-MM-DD 23:59:59');
    const totalAi = await this.logAIRepository.count({
      where: {
        user_id: user_id,
        create_at: Between(startOfDay, endOfDay),
        ai_type: ai_type,
      },
    });
    if (isFree) {
      if (totalAi >= limitation) {
        code = AI_CODE_RESPONSE.OUT_OF_LIMIT;
        codeDesc = AI_CODE_RESPONSE_MESSAGE.OUT_OF_LIMIT;
      }
    }
    // }

    return {
      code: code,
      message: codeDesc,
      is_free: isFree,
    };
  }

  /**
   * Wallet balance for the AI_GENERAL pool (shared by old Mate chat + new bazi chat).
   * - Active MEMBER (Soulmate/VIP, not expired) → unlimited, wallet untouched.
   * - Existing wallet row → its stored balance.
   * - No row yet → footprint-aware seed via Option B: used=0 grants WELCOME 3,
   *   legacy overflow (usage but no row, pre-migration) backfills max(0, 3 − used).
   *   The seed row is created idempotently so welcome is granted at most once.
   */
  async getBalanceInfo(user_id: string): Promise<{
    isMember: boolean;
    unlimited: boolean;
    balance: number;
  }> {
    const userInfo = await this.memberPaymentService.getMemberPayment({
      user_id: user_id,
    } as MemberPaymentGetInput);
    const isMember =
      !!userInfo &&
      userInfo.plan_code == PaymentPlan.MEMBER &&
      this.isNotExpired(userInfo.expire_at);
    if (isMember) {
      return { isMember: true, unlimited: true, balance: 0 };
    }

    const wallet = await this.memberPayAsUseService.getMemberPayAsUse(user_id);
    if (wallet) {
      return {
        isMember: false,
        unlimited: false,
        balance: wallet.balance ?? 0,
      };
    }

    // No wallet row: seed from lifetime AI_GENERAL usage (Option B formula).
    const used = await this.logAIRepository.count({
      where: { user_id: user_id, ai_type: FEATURE_TYPE.AI_GENERAL },
    });
    const balance = computeMigratedBalance(0, used);
    await this.memberPayAsUseService.upsertBalance(user_id, balance);
    return { isMember: false, unlimited: false, balance };
  }

  /**
   * Wallet gate for the AI_GENERAL pool. Members are unlimited. When enforcement
   * is on, a non-member with no remaining balance is blocked (OUT_OF_LIMIT). When
   * `CREDIT_ENFORCE=off`, balance is tracked but never blocks (counter-only mode).
   */
  async checkWalletGate(user_id: string): Promise<{
    allowed: boolean;
    unlimited: boolean;
    balance: number;
    code: number;
    message: string;
  }> {
    const info = await this.getBalanceInfo(user_id);
    if (info.unlimited) {
      return {
        allowed: true,
        unlimited: true,
        balance: 0,
        code: AI_CODE_RESPONSE.SUCCESS,
        message: AI_CODE_RESPONSE_MESSAGE.SUCCESS,
      };
    }
    if (!isCreditEnforced() || info.balance > 0) {
      return {
        allowed: true,
        unlimited: false,
        balance: info.balance,
        code: AI_CODE_RESPONSE.SUCCESS,
        message: AI_CODE_RESPONSE_MESSAGE.SUCCESS,
      };
    }
    return {
      allowed: false,
      unlimited: false,
      balance: 0,
      code: AI_CODE_RESPONSE.OUT_OF_LIMIT,
      message: AI_CODE_RESPONSE_MESSAGE.OUT_OF_LIMIT,
    };
  }

  /** Reject calls to the consume endpoint that don't carry the BFF↔BE shared secret. */
  private assertConsumeSecret(secret: string): void {
    const expected = process.env.AI_CONSUME_SECRET;
    if (!expected || secret !== expected) {
      throw new HttpException(
        { code: 401, message: 'Unauthorized', error: 'Error' },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  /**
   * Spend exactly one AI_GENERAL credit (called by the FE BFF after a successful
   * answer). Secret-guarded. Members are unlimited and are never charged.
   */
  async consumeCredit(
    user_id: string,
    secret: string,
  ): Promise<{ ok: boolean; unlimited: boolean; balance: number }> {
    this.assertConsumeSecret(secret);
    const info = await this.getBalanceInfo(user_id);
    if (info.unlimited) {
      return { ok: true, unlimited: true, balance: 0 };
    }
    const res = await this.memberPayAsUseService.consume(user_id);
    return { ok: res.ok, unlimited: false, balance: res.balance };
  }

  async chatAIFortuneStick(_input: AiChatFortuneStickInput): Promise<any> {
    let isRunAi = false;
    const responseCheck: any = await this.isCheckUsage(
      _input.user_id,
      AI_CHAT_LIMIT.FREE_FORTUNE,
      AI_CHAT_LIMIT.MEMBER_FORTUNE,
      FEATURE_TYPE.AI_FORTUNE,
    );
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

    if (isRunAi == true) {
      try {
        const result = await this.callAiChatFortune(
          _input.card_no,
          _input.message,
          _input.session_id,
        );
        if (result && result.output) {
          await this.saveToLog(
            _input.user_id,
            _input.message,
            FEATURE_TYPE.AI_FORTUNE,
          );
          return {
            code: 200,
            message: result.output,
          };
        }
      } catch (e: any) {
        throw new HttpException(
          {
            code: 401,
            message: 'Unexpected error',
            error: e.error,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    throw new HttpException(
      {
        code: 401,
        message: 'Unexpected error',
        error: 'Error',
      },
      HttpStatus.GONE,
    );
  }

  randomString(length = 5) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  getYMD() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
  }

  // FORTUNE
  async callAiChatFortune(card_no: string, message: string, user_id: string) {
    const url =
      'https://n8n.chatify.cloud/webhook/mumate-oracle-agent-blocking';
    // const url = 'https://n8n.chatify.cloud/webhook/mumate-oracle-agent-streaming';

    const payload = {
      no: card_no,
      user_id: user_id,
      message: message,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // กัน API ค้าง
        }),
      );

      return response.data;
    } catch (error) {
      // 👉 กรณี API ตอบ error (4xx / 5xx)
      if (axios.isAxiosError(error)) {
        const status =
          error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
          error.response?.data ?? error.message ?? 'Oracle service error';

        throw new HttpException(
          {
            code: 401,
            message: 'Call oracle failed',
            error: message,
          },
          status,
        );
      }

      // 👉 error ที่ไม่ใช่ axios
      throw new HttpException(
        {
          code: 401,
          message: 'Unexpected error',
          error: error?.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // GENERAL
  async callAiChat(
    message: string,
    user_id: string,
    conversation_id: string,
    jsonString: string,
    is_streaming: boolean,
  ) {
    const url =
      process.env.DIFY_API_URL || 'https://dify.chatify.cloud/v1/chat-messages';

    const inputs = {
      baziProfile: jsonString,
    };

    const payload = {
      inputs: inputs,
      query: message,
      conversation_id: conversation_id,
      response_mode: is_streaming ? 'streaming' : 'blocking', // blocking, streaming
      user: user_id,
    };
    try {
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.DIFY_API_KEY}`,
          },
          timeout: 60000, // กัน API ค้าง
        }),
      );
      return response.data;
    } catch (error) {
      // 👉 กรณี API ตอบ error (4xx / 5xx)
      if (axios.isAxiosError(error)) {
        const status =
          error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
          error.response?.data ?? error.message ?? 'Oracle service error';

        throw new HttpException(
          {
            code: 401,
            message: 'Call oracle failed',
            error: message,
          },
          status,
        );
      }

      // 👉 error ที่ไม่ใช่ axios
      throw new HttpException(
        {
          code: 401,
          message: 'Unexpected error',
          error: error?.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async callAiChatStream(
    res: Response,
    message: string,
    user_id: string,
    conversation_id: string,
    jsonString: string,
  ) {
    const url =
      process.env.DIFY_API_URL || 'https://dify.chatify.cloud/v1/chat-messages';

    const payload = {
      inputs: { baziProfile: jsonString },
      query: message,
      response_mode: 'streaming',
      user: user_id,
      conversation_id: conversation_id,
    };

    try {
      // ✅ upstream เป็น stream จริง
      const upstream = await firstValueFrom(
        this.httpService.post(url, payload, {
          responseType: 'stream',
          headers: {
            Authorization: `Bearer ${process.env.DIFY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }),
      );

      // ✅ ตั้ง SSE ให้ฝั่ง client
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');

      // (optional) flush headers เร็วๆ
      res.flushHeaders?.();

      upstream.data.on('data', (chunk: Buffer) => {
        // ส่งต่อ “ดิบๆ” เลย (เป็นบรรทัด data: ...\n\n อยู่แล้ว)
        res.write(chunk);
      });

      upstream.data.on('end', () => {
        res.end();
      });

      upstream.data.on('error', (err: any) => {
        res.write(
          `data: ${JSON.stringify({
            event: 'error',
            message: String(err?.message ?? err),
          })}\n\n`,
        );
        res.end();
      });
    } catch (error) {
      const status = axios.isAxiosError(error)
        ? error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR
        : HttpStatus.INTERNAL_SERVER_ERROR;

      throw new HttpException(
        {
          code: status,
          message: 'Call AI failed',
          error: axios.isAxiosError(error)
            ? error.response?.data ?? error.message
            : error?.message,
        },
        status,
      );
    }
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

  // CHAT AI GENERAL
  async chatAI(_input: AiChatInput, is_streaming: boolean): Promise<any> {
    let isRunAi = false;
    // AI_GENERAL now gates on the wallet (balance>0 or member-unlimited),
    // honoring CREDIT_ENFORCE. Old yearly-window check is retired for this pool.
    const gate = await this.checkWalletGate(_input.user_id);
    if (!gate.allowed) {
      isRunAi = false;
      throw new HttpException(
        {
          code: gate.code,
          message: gate.message,
          error: 'Error',
        },
        HttpStatus.GONE,
      );
    } else {
      isRunAi = true;
    }

    if (isRunAi == true) {
      let jsonString = '';

      try {
        const userData = await this.userService.getUserById({
          user_id: _input.user_id,
        });
        if (userData) {
          const log = await this.logCalculateService.getLogCalculate(
            userData.result_code,
            userData.user_id,
          );
          if (log) {
            console.log('log.result:', log.result);
            const resultHoroscope = JSON.parse(log.result);
            const s = resultHoroscope.summary;
            const d = resultHoroscope.detail;

            const safeDetail = (x: any) =>
              x
                ? {
                    chinese_symbol: x.chinese_symbol,
                    element: x.element,
                    power: x.power,
                  }
                : null;

            const obj = {
              dob: resultHoroscope.dob,
              time: resultHoroscope.time,
              gender: resultHoroscope.gender,
              user_selected_category: _input.category,

              summary: {
                element: s?.element ?? null,
                power: s?.power ?? null,

                year: {
                  above: s?.year?.above ?? null,
                  below: s?.year?.below ?? null,
                  element: s?.year?.element ?? null,
                },
                month: {
                  above: s?.month?.above ?? null,
                  below: s?.month?.below ?? null,
                  element: s?.month?.element ?? null,
                },
                day: {
                  above: s?.day?.above ?? null,
                  below: s?.day?.below ?? null,
                  element: s?.day?.element ?? null,
                },

                // ✅ time ไม่มี element ใน JSON -> ตั้งเป็น null
                time: {
                  above: s?.time?.above ?? null,
                  below: s?.time?.below ?? null,
                  element: s?.time?.element ?? null, // หรือใส่ null ตรง ๆ ก็ได้
                },
              },

              detail: {
                yearAbove: safeDetail(d?.yearAbove),
                yearBelow: safeDetail(d?.yearBelow),
                monthAbove: safeDetail(d?.monthAbove),
                monthBelow: safeDetail(d?.monthBelow),
                dayAbove: safeDetail(d?.dayAbove),
                dayBelow: safeDetail(d?.dayBelow),

                // ✅ กัน null
                timeAbove: safeDetail(d?.timeAbove),
                timeBelow: safeDetail(d?.timeBelow),
              },

              cycleLife: {
                age: resultHoroscope?.cycleLife?.age ?? null,
                ageZodiac: resultHoroscope?.cycleLife?.ageZodiac ?? null,
                ageElement: resultHoroscope?.cycleLife?.ageElement ?? null,
              },

              analytic: {
                love: {
                  note: resultHoroscope?.analytic?.love?.note ?? null,
                },
              },
            };
            console.log('obj ai:', obj);
            jsonString = JSON.stringify(obj);
            console.log('obj jsonString:', jsonString);
          }
        }
      } catch (e) {
        throw new HttpException(
          {
            code: 401,
            message: 'Unexpected error[1]',
            error: e.error,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      try {
        const result = await this.callAiChat(
          _input.message,
          _input.user_id,
          _input.conversation_id,
          jsonString,
          is_streaming,
        );
        console.log('result callAiChat', result);

        if (result && result.answer) {
          await this.saveToLog(
            _input.user_id,
            _input.message,
            FEATURE_TYPE.AI_GENERAL,
          );
          // Deduct one credit on a successful answer (members are unlimited).
          if (!gate.unlimited) {
            await this.memberPayAsUseService.consume(_input.user_id);
          }
          return {
            code: 200,
            message: result.answer,
          };
        }
      } catch (e) {
        throw new HttpException(
          {
            code: 401,
            message: 'Unexpected error[2]',
            error: e.error,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    throw new HttpException(
      {
        code: 401,
        message: 'Unexpected error[3]',
        error: 'Error',
      },
      HttpStatus.GONE,
    );
  }

  async chatAIStreaming(_input: AiChatInput, res: Response): Promise<any> {
    let isRunAi = false;
    // AI_GENERAL now gates on the wallet (balance>0 or member-unlimited),
    // honoring CREDIT_ENFORCE. Old yearly-window check is retired for this pool.
    const gate = await this.checkWalletGate(_input.user_id);
    if (!gate.allowed) {
      isRunAi = false;
      throw new HttpException(
        {
          code: gate.code,
          message: gate.message,
          error: 'Error',
        },
        HttpStatus.GONE,
      );
    } else {
      isRunAi = true;
    }

    if (isRunAi == true) {
      let jsonString = '';

      try {
        const userData = await this.userService.getUserById({
          user_id: _input.user_id,
        });
        if (userData) {
          const log = await this.logCalculateService.getLogCalculate(
            userData.result_code,
            userData.user_id,
          );

          if (log) {
            console.log('log.result:', log.result);
            const resultHoroscope = JSON.parse(log.result);
            const s = resultHoroscope.summary;
            const d = resultHoroscope.detail;

            const safeDetail = (x: any) =>
              x
                ? {
                    chinese_symbol: x.chinese_symbol,
                    element: x.element,
                    power: x.power,
                  }
                : null;

            const obj = {
              dob: resultHoroscope.dob,
              time: resultHoroscope.time,
              gender: resultHoroscope.gender,
              user_selected_category: _input.category,

              summary: {
                element: s?.element ?? null,
                power: s?.power ?? null,

                year: {
                  above: s?.year?.above ?? null,
                  below: s?.year?.below ?? null,
                  element: s?.year?.element ?? null,
                },
                month: {
                  above: s?.month?.above ?? null,
                  below: s?.month?.below ?? null,
                  element: s?.month?.element ?? null,
                },
                day: {
                  above: s?.day?.above ?? null,
                  below: s?.day?.below ?? null,
                  element: s?.day?.element ?? null,
                },

                // ✅ time ไม่มี element ใน JSON -> ตั้งเป็น null
                time: {
                  above: s?.time?.above ?? null,
                  below: s?.time?.below ?? null,
                  element: s?.time?.element ?? null, // หรือใส่ null ตรง ๆ ก็ได้
                },
              },

              detail: {
                yearAbove: safeDetail(d?.yearAbove),
                yearBelow: safeDetail(d?.yearBelow),
                monthAbove: safeDetail(d?.monthAbove),
                monthBelow: safeDetail(d?.monthBelow),
                dayAbove: safeDetail(d?.dayAbove),
                dayBelow: safeDetail(d?.dayBelow),

                // ✅ กัน null
                timeAbove: safeDetail(d?.timeAbove),
                timeBelow: safeDetail(d?.timeBelow),
              },

              cycleLife: {
                age: resultHoroscope?.cycleLife?.age ?? null,
                ageZodiac: resultHoroscope?.cycleLife?.ageZodiac ?? null,
                ageElement: resultHoroscope?.cycleLife?.ageElement ?? null,
              },

              analytic: {
                love: {
                  note: resultHoroscope?.analytic?.love?.note ?? null,
                },
              },
            };
            console.log('obj ai:', obj);
            jsonString = JSON.stringify(obj);
            console.log('obj jsonString:', jsonString);
          }
        }
      } catch (e) {
        throw new HttpException(
          {
            code: 401,
            message: 'Unexpected error 1.1',
            error: e.error,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      try {
        const result = await this.callAiChatStream(
          res,
          _input.message,
          _input.user_id,
          _input.conversation_id,
          jsonString,
        );
        await this.saveToLog(
          _input.user_id,
          _input.message,
          FEATURE_TYPE.AI_GENERAL,
        );
        // Deduct one credit on a successful answer (members are unlimited).
        if (!gate.unlimited) {
          await this.memberPayAsUseService.consume(_input.user_id);
        }
        return result;
      } catch (e) {
        throw new HttpException(
          {
            code: 401,
            message: 'Unexpected error 1.2',
            error: e.error,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    throw new HttpException(
      {
        code: 401,
        message: 'Unexpected error  1.3',
        error: 'Error',
      },
      HttpStatus.GONE,
    );
  }
}
