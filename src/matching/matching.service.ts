import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { MomentService } from 'src/utils/MomentService';
import { UserMatching } from './entity/matching-entity.model';
import { LogMatching } from './entity/log-matching-entity.model';
import { MatchingCreateInput } from './dto/matching-create.input';
import { UserService } from 'src/user/user.service';
import { UserGetByIdInput } from 'src/user/dto/user-get-by-id';
import { MemberWithFriendService } from 'src/member-with-friend/member-with-friend.service';
import { MemberWithFriendGetByIdInput } from 'src/member-with-friend/dto/member-with-friend-get-by-id-input';
import { CompatibilityLoveAnalyticInput } from 'src/chinese-horoscope/dto/compatibility-love-analytic.input';
import { ChineseHoroscopeService } from 'src/chinese-horoscope/chinese-horoscope.service';
import { MatchingGetInput } from './dto/matching-get.input';
import { MatchingGetDetailInput } from './dto/matching-get-detail.input';
import { User } from 'src/user/entity/user-entity.model';
import { MemberWithFriend } from 'src/member-with-friend/entity/member-with-friend-entity.model';
import { MemberPaymentService } from 'src/member-payment/member-payment.service';
import { MemberPaymentGetInput } from 'src/member-payment/dto/member-payment-get.input';
import {
  AI_CODE_RESPONSE,
  AI_CODE_RESPONSE_MESSAGE,
} from 'src/constants/ai-code-response';
import { PaymentPlan } from 'src/constants/payment-plan';
import { MATCHING_LIMIT } from 'src/constants/matching-limit';

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(UserMatching)
    private readonly userMatchingRepository: Repository<UserMatching>,
    @InjectRepository(LogMatching)
    private readonly logMatchingRepository: Repository<LogMatching>,

    private userService: UserService,
    private memberPaymentService: MemberPaymentService,
    private memberWithFriendService: MemberWithFriendService,
    private chineseHoroscopeController: ChineseHoroscopeService,
    private momentWrapper: MomentService,
  ) {}

  async isCheckUsage(user_id: string, limit_free: number): Promise<any> {
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

    // CHECK LIMIT
    let limitation = limit_free;
    if (isFree == true) {
      limitation = limit_free;
    }

    const startOfDay = this.momentWrapper
      .moment()
      .startOf('year')
      .format('YYYY-MM-DD 00:00:00');
    const endOfDay = this.momentWrapper
      .moment()
      .endOf('year')
      .format('YYYY-MM-DD 23:59:59');
    const totalAi = await this.userMatchingRepository.count({
      where: {
        user_id: user_id,
        create_at: Between(startOfDay, endOfDay),
      },
    });
    if (isFree) {
      if (totalAi >= limitation) {
        code = AI_CODE_RESPONSE.OUT_OF_LIMIT;
        codeDesc = AI_CODE_RESPONSE_MESSAGE.OUT_OF_LIMIT_ALL;
      }
    }
    return {
      code: code,
      message: codeDesc,
      is_free: isFree,
    };
  }

  async calculateMatching(
    _input: MatchingCreateInput,
    is_logging = true,
    is_check_limit = true,
  ): Promise<any> {
    let isRunAi = false;
    const responseCheck: any = await this.isCheckUsage(
      _input.user_id,
      MATCHING_LIMIT.FREE,
    );

    if (is_check_limit == true) {
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
    }

    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');

    const userId = _input.user_id;
    const friendId = _input.friend_id;

    let userInfo = null;
    let friendInfo = null;

    try {
      userInfo = await this.userService.getUserById({
        user_id: userId,
      } as UserGetByIdInput);
    } catch (e) {}

    friendInfo = await this.memberWithFriendService.getMemberWithFriendById({
      id: friendId,
    } as MemberWithFriendGetByIdInput);

    if (!userInfo || !friendInfo) {
      return;
    }

    const requestCalculate = {
      user_id: userId,
      me: {
        name: userInfo.name,
        gender: userInfo.gender,
        dob: userInfo.dob,
        time: userInfo.time ? userInfo.time : '',
      },
      you: {
        name: friendInfo.name,
        gender: friendInfo.gender,
        dob: friendInfo.dob,
        time: friendInfo.time ? friendInfo.time : '',
      },
      type: _input.matching_type, // BOSS FRIEND EMPLOYEE
      ignore_check: false,
    } as CompatibilityLoveAnalyticInput;

    let resultMatching = null;
    if (_input.matching_type == 'LOVE') {
      const r = await this.chineseHoroscopeController.compatibilityLove(
        requestCalculate,
      );
      console.log('compatibilityLove:');
      console.log(r);
      if (r && r.status != 400) {
        resultMatching = r;
      }
    } else {
      const r = await this.chineseHoroscopeController.compatibilityWork(
        requestCalculate,
      );
      console.log('compatibilityWork:');
      console.log(r);
      if (r && r.status != 400) {
        resultMatching = r;
      }
    }

    if (resultMatching && resultMatching.result) {
      const calculateEntity = new UserMatching();
      calculateEntity.create_at = createAt;
      calculateEntity.friend_id = friendId;
      calculateEntity.user_id = userId;
      calculateEntity.matching_type = _input.matching_type;
      const resultEntity = await this.userMatchingRepository.save(
        calculateEntity,
      );

      // LOGGING
      const logCalculateEntity = new LogMatching();
      logCalculateEntity.matching_id = resultEntity.id;
      logCalculateEntity.user_id = _input.user_id;
      logCalculateEntity.createAt = createAt;
      logCalculateEntity.name = userInfo.name;
      logCalculateEntity.dob = userInfo.dob;
      logCalculateEntity.time = userInfo.time;
      logCalculateEntity.is_remember_time =
        userInfo.time && userInfo.time != '';
      logCalculateEntity.gender = userInfo.gender;
      logCalculateEntity.type = _input.matching_type;

      logCalculateEntity.your_name = friendInfo.name;
      logCalculateEntity.your_dob = friendInfo.dob;
      logCalculateEntity.your_time = friendInfo.time;
      logCalculateEntity.your_is_remember_time =
        friendInfo.time && friendInfo.time != '';
      logCalculateEntity.your_gender = friendInfo.gender;
      logCalculateEntity.friend_id = friendId;
      logCalculateEntity.result = JSON.stringify(resultMatching);

      if (is_logging) {
        const result = await this.logMatchingRepository.save(
          logCalculateEntity,
        );
      }

      console.log(logCalculateEntity);
      return logCalculateEntity;
    }

    return null;
  }

  async getLogMatching(_input: MatchingGetInput): Promise<any> {
    const subQuery = this.logMatchingRepository
      .createQueryBuilder('lm')
      .leftJoin(UserMatching, 'um', 'lm.matching_id = um.id')
      .select([
        'lm.user_id AS user_id',
        'um.friend_id AS friend_id',
        'um.matching_type AS matching_type',
        'MAX(um.create_at) AS max_create_at',
      ])
      .where('lm.user_id = :userId', {
        userId: _input.user_id,
      })
      .groupBy('lm.user_id')
      .addGroupBy('um.friend_id')
      .addGroupBy('um.matching_type');

    const results = await this.logMatchingRepository
      .createQueryBuilder('log_matching')
      .leftJoin(User, 'user', 'log_matching.user_id = user.user_id')
      .leftJoin(
        UserMatching,
        'user_matching',
        'log_matching.matching_id = user_matching.id',
      )
      .leftJoin(
        MemberWithFriend,
        'friend',
        'user_matching.friend_id = friend.id',
      )
      .innerJoin(
        `(${subQuery.getQuery()})`,
        'latest',
        `
      latest.user_id = log_matching.user_id
      AND latest.friend_id = user_matching.friend_id
      AND latest.matching_type = user_matching.matching_type
      AND latest.max_create_at = user_matching.create_at
      `,
      )
      .setParameters(subQuery.getParameters())
      .select([
        'user_matching.id AS user_matching_id',

        'user.name AS user_name',
        'user.surname AS user_surname',
        'user.picture_url AS user_picture_url',

        'friend.name AS friend_name',
        'friend.surname AS friend_surname',
        'friend.picture_url AS friend_picture_url',

        'user_matching.matching_type AS user_matching_matching_type',
        'user_matching.create_at AS user_matching_create_at',
      ])
      .orderBy('user_matching.create_at', 'DESC')
      .getRawMany();

    const lists: any[] = [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      lists.push({
        id: result.user_matching_id,
        user: {
          name: result.user_name,
          user_surname: result.user_surname,
          picture: result.user_picture_url,
        },
        friend: {
          name: result.friend_name,
          user_surname: result.friend_surname,
          picture: result.friend_picture_url,
        },
        type: result.user_matching_matching_type,
      });
    }

    return lists;
  }

  async getLogMatchingDetail(_input: MatchingGetDetailInput): Promise<any> {
    const result = await this.logMatchingRepository
      .createQueryBuilder('log_matching')
      .leftJoinAndSelect(User, 'user', 'log_matching.user_id = user.user_id')
      .leftJoinAndSelect(
        UserMatching,
        'user_matching',
        'log_matching.matching_id = user_matching.id',
      )
      .leftJoinAndSelect(
        MemberWithFriend,
        'friend',
        'user_matching.friend_id = friend.id',
      )
      .where('log_matching.matching_id = :matchingId', {
        matchingId: _input.matching_id,
      })
      .select(['log_matching', 'user', 'friend', 'user_matching'])
      .getRawOne();
    console.log('getLogMatchingDetail:');
    console.log(result);

    if (result) {
      return {
        user: {
          name: result.user_name,
          user_surname: result.user_surname,
          picture: result.user_picture_url,
        },
        friend: {
          name: result.friend_name,
          user_surname: result.friend_surname,
          picture: result.friend_picture_url,
        },
        result: result.log_matching_result,
        type: result.user_matching_matching_type,
      };
    }
    return null;
  }

  async reCalculateMatching(_input: MatchingGetDetailInput): Promise<any> {
    const result = await this.logMatchingRepository
      .createQueryBuilder('log_matching')
      .leftJoinAndSelect(User, 'user', 'log_matching.user_id = user.user_id')
      .leftJoinAndSelect(
        UserMatching,
        'user_matching',
        'log_matching.matching_id = user_matching.id',
      )
      .leftJoinAndSelect(
        MemberWithFriend,
        'friend',
        'user_matching.friend_id = friend.id',
      )
      .where('log_matching.matching_id = :matchingId', {
        matchingId: _input.matching_id,
      })
      .select(['log_matching', 'user', 'friend', 'user_matching'])
      .getRawOne();
    console.log('getLogMatchingDetail:');
    console.log(result);

    if (result) {
      return await this.calculateMatching(
        {
          user_id: result.user_user_id,
          friend_id: result.friend_id,
          matching_type: result.log_matching_type,
        } as MatchingCreateInput,
        true,
        false,
      );
    }
    return null;
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
