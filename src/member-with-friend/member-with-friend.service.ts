import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MomentService } from 'src/utils/MomentService';
import { MemberWithFriend } from './entity/member-with-friend-entity.model';
import { MemberWithFriendCreateInput } from './dto/member-with-friend-create-input';
import { MemberWithFriendRegisteredCreateInput } from './dto/member-with-friend-registered-create-input';
import { MemberWithFriendGetInput } from './dto/member-with-friend-get-input';
import { MemberWithFriendGetByIdInput } from './dto/member-with-friend-get-by-id-input';
import { MemberWithFriendUpdateInput } from './dto/member-with-friend-update-input';
import { MemberWithFriendUpdateProfileInput } from './dto/member-with-friend-update-profile-input';
import { MemberPaymentGetInput } from 'src/member-payment/dto/member-payment-get.input';
import { MemberPaymentService } from 'src/member-payment/member-payment.service';
import {
  AI_CODE_RESPONSE,
  AI_CODE_RESPONSE_MESSAGE,
} from 'src/constants/ai-code-response';
import { PaymentPlan } from 'src/constants/payment-plan';
import { UserService } from 'src/user/user.service';
@Injectable()
export class MemberWithFriendService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @InjectRepository(MemberWithFriend)
    private readonly memberWithFriendRepository: Repository<MemberWithFriend>,
    private momentWrapper: MomentService,
    private memberPaymentService: MemberPaymentService,
  ) {}

  getLimit = (is_free: boolean): number => {
    // เพดานเพื่อนชั่วคราวก่อน launch (ฟีมเคาะ 2026-08-13, #20): free 1 → 20
    return is_free ? 20 : 20;
  };

  async isCheckUsage(
    user_id: string,
    limit_free: number,
    limit_member: number,
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

    // CHECK LIMIT
    let limitation = limit_free;
    if (isFree == true) {
      limitation = limit_free;
    } else {
      limitation = limit_member;
    }

    const totalAi = await this.memberWithFriendRepository.count({
      where: {
        user_id: user_id,
      },
    });
    if (isFree) {
      if (totalAi >= limitation) {
        code = AI_CODE_RESPONSE.OUT_OF_LIMIT;
        codeDesc = AI_CODE_RESPONSE_MESSAGE.OUT_OF_LIMIT_ALL;
      }
    } else {
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

  async createMemberWithFriend(
    _input: MemberWithFriendCreateInput,
  ): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');

    let isRunAi = false;
    const responseCheck: any = await this.isCheckUsage(
      _input.user_id,
      this.getLimit(true),
      this.getLimit(false),
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

    const userEntity = new MemberWithFriend();
    userEntity.create_at = createAt;
    userEntity.name = _input.name;
    userEntity.surname = _input.surname;
    userEntity.gender = _input.gender;
    userEntity.dob = _input.dob;
    userEntity.is_remember_time = _input.is_remember_time;
    userEntity.time = _input.time;
    userEntity.place_name = '';
    userEntity.picture_url = _input.picture_url;
    userEntity.update_at = createAt;
    userEntity.user_id = _input.user_id;
    userEntity.is_member = false;
    userEntity.member_id = '';

    const result = await this.memberWithFriendRepository.save(userEntity);
    return result;
  }

  async createMemberWithFriendRegistered(
    _input: MemberWithFriendRegisteredCreateInput,
  ): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');

    const exitsMember = await this.memberWithFriendRepository.findOne({
      where: {
        member_id: _input.member_id,
        user_id: _input.user_id,
      },
    });
    if (exitsMember) {
      return null;
    }

    const userEntity = new MemberWithFriend();
    userEntity.create_at = createAt;
    userEntity.name = _input.name;
    userEntity.surname = _input.surname;
    userEntity.gender = _input.gender;
    userEntity.dob = _input.dob;
    userEntity.is_remember_time = _input.is_remember_time;
    userEntity.time = _input.time;
    userEntity.place_name = '';
    userEntity.picture_url = _input.picture_url;
    userEntity.update_at = createAt;
    userEntity.user_id = _input.user_id;
    userEntity.is_member = true;
    userEntity.member_id = _input.member_id;

    const result = await this.memberWithFriendRepository.save(userEntity);
    return result;
  }

  async getMemberWithFriend(_input: MemberWithFriendGetInput): Promise<any> {
    console.log('getMemberWithFriend:');

    const result = await this.memberWithFriendRepository.find({
      where: {
        user_id: _input.user_id,
      },
      order: {
        create_at: 'ASC',
      },
    });
    console.log('result:', result.length);
    let isRunAi = false;
    const responseCheck: any = await this.isCheckUsage(
      _input.user_id,
      this.getLimit(true),
      this.getLimit(false),
    );

    if (responseCheck && responseCheck.code != AI_CODE_RESPONSE.SUCCESS) {
      isRunAi = false;
    } else {
      isRunAi = true;
    }

    const lists = [];
    for (let i = 0; i < result.length; i++) {
      const raw = result[i];
      console.log(i);

      if (raw.member_id != '') {
        const friend = await this.userService.getUserId(raw.member_id);
        lists.push({
          id: raw.id,
          user_id: raw.user_id,
          name: friend.name,
          surname: friend.surname,
          picture_url: friend.picture_url,
          create_at: friend.create_at,
          update_at: friend.update_at,
          dob: friend.dob,
          time: friend.time,
          is_remember_time: friend.is_remember_time,
          gender: friend.gender,
          place_name: friend.place_name,
          is_member: true,
          member_id: friend.user_id,
          is_disable: isRunAi ? false : i > this.getLimit(true),
        });
      } else {
        lists.push({
          id: raw.id,
          user_id: raw.user_id,
          name: raw.name,
          surname: raw.surname,
          picture_url: raw.picture_url,
          create_at: raw.create_at,
          update_at: raw.update_at,
          dob: raw.dob,
          time: raw.time,
          is_remember_time: raw.is_remember_time,
          gender: raw.gender,
          place_name: raw.place_name,
          is_member: false,
          member_id: '',
          is_disable: isRunAi ? false : i > this.getLimit(true),
        });
      }
    }

    return lists;
  }

  async getMemberWithFriendById(
    _input: MemberWithFriendGetByIdInput,
  ): Promise<any> {
    const result = await this.memberWithFriendRepository.findOne({
      where: {
        id: _input.id,
      },
    });
    if (result && result.is_member == true) {
      const friend = await this.userService.getUserId(result.member_id);
      return {
        id: result.id,
        user_id: result.user_id,
        name: friend.name,
        surname: friend.surname,
        picture_url: friend.picture_url,
        create_at: friend.create_at,
        update_at: friend.update_at,
        dob: friend.dob,
        time: friend.time,
        is_remember_time: friend.is_remember_time,
        gender: friend.gender,
        place_name: friend.place_name,
        is_member: true,
        member_id: friend.user_id,
      };
    }
    return result;
  }

  async getMemberWithFriendNewFriend(_input: any): Promise<any> {
    const result = await this.memberWithFriendRepository.find({
      where: {
        user_id: _input.user_id,
        is_notify: false,
        is_member: true,
      },
    });

    if (result.length > 0) {
      await this.memberWithFriendRepository.update(
        {
          user_id: _input.user_id,
          is_notify: false,
        },
        {
          is_notify: true,
        },
      );
    }
    return result;
  }

  async updateMemberWithFriend(
    _input: MemberWithFriendUpdateInput,
  ): Promise<any> {
    const result = await this.memberWithFriendRepository.findOne({
      where: {
        id: _input.friend_id,
      },
    });
    result.picture_url = _input.image;
    const r = await this.memberWithFriendRepository.save(result);
    return r;
  }

  async updateMemberWithFriendProfile(
    _input: MemberWithFriendUpdateProfileInput,
  ): Promise<any> {
    const userEntity = await this.memberWithFriendRepository.findOne({
      where: {
        id: _input.friend_id,
      },
    });
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    userEntity.update_at = createAt;
    userEntity.name = _input.name;
    userEntity.surname = _input.surname;
    userEntity.gender = _input.gender;
    userEntity.dob = _input.dob;
    userEntity.is_remember_time = _input.is_remember_time;
    userEntity.time = _input.time;
    userEntity.place_name = '';
    userEntity.update_at = createAt;
    const r = await this.memberWithFriendRepository.save(userEntity);
    return r;
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
