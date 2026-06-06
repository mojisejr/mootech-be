import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { MomentService } from 'src/utils/MomentService';
import { OTP } from './entity/otp-entity.model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OTPResponse } from './model/otp-response.model';
import { OTPInput } from './dto/otp.input';
import { UserService } from 'src/user/user.service';
import { UserGetByTelInput } from 'src/user/dto/user-get-by-tel';
import { OTPVerifyInput } from './dto/otp-verify.input';
import { SmsSenderService } from 'src/sms-sender/sms-sender.service';
import { SMSSendSMSInput } from 'src/sms-sender/dto/sms-send-sms-input';
import { UserRegisterWithTelInput } from 'src/user/dto/user-register-with-tel.input';

@Injectable()
export class OTPService {
  constructor(
    @InjectRepository(OTP)
    private readonly oTPRepository: Repository<OTP>,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private smsSenderService: SmsSenderService,
    private momentWrapper: MomentService,
  ) {}

  async getOTP(_input: OTPInput): Promise<any> {
    let userResult = null;

    userResult = await this.userService.registerAndLoginWithTel({
      tel: _input.tel,
      name: '',
      surname: '',
      refer_code: '',
    } as UserRegisterWithTelInput);

    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    const expireAt = this.momentWrapper
      .moment()
      .add(5, 'minutes')
      .format('YYYY-MM-DD HH:mm:ss');
    const length = 6;
    const refCode = this.generateRandomAlphabet();
    const otp = Math.floor(Math.random() * Math.pow(10, length))
      .toString()
      .padStart(length, '0');
    const message = `รหัส OTP ของคุณคือ ${otp} อ้างอิง ${refCode} รหัสนี้จะหมดอายุใน 5 นาที โปรดอย่าเปิดเผยรหัสนี้กับผู้อื่น`;
    const otpEntity = new OTP();
    otpEntity.tel = _input.tel;
    otpEntity.message = message;
    otpEntity.ref_code = refCode;
    otpEntity.code = otp;
    otpEntity.user_id = userResult ? userResult.user_id : '';
    otpEntity.create_at = createAt;
    otpEntity.expire_at = expireAt;
    const result = await this.oTPRepository.save(otpEntity);
    console.log(result);

    await this.smsSenderService.sendSMS({
      tel: _input.tel,
      message: message,
    } as SMSSendSMSInput);
    return {
      tel: _input.tel,
      // otp: otp,
      user_id: userResult ? userResult.user_id : '',
      is_new: userResult && userResult.name != '' ? false : true,
      name: userResult ? userResult.name : '',
      surname: userResult ? userResult.surname : '',
      refer_code: userResult ? userResult.refer_code : '',
      ref_code: refCode,
      expireAt: expireAt,
      message: message,
    } as OTPResponse;
  }

  async verifyOTP(_input: OTPVerifyInput): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    const result = await this.oTPRepository.findOne({
      where: {
        code: _input.otp,
        ref_code: _input.ref_code,
      },
    });
    const resultw = await this.oTPRepository.find();
    console.log(_input);
    console.log(result);
    console.log(resultw);
    if (!result) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'OTP not found.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (createAt <= result.expire_at) {
      result.verify_at = createAt;
      await this.oTPRepository.save(result);

      let userResult = null;

      userResult = await this.userService.getUserByTel({
        tel: result.tel,
      } as UserRegisterWithTelInput);
      return {
        status: 200,
        user_id: userResult ? userResult.user_id : '',
        is_new: userResult && userResult.name != '' ? false : true,
        name: userResult ? userResult.name : '',
        surname: userResult ? userResult.surname : '',
        refer_code: userResult ? userResult.refer_code : '',
      };
    }

    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        error: 'OTP is expired.',
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  private generateRandomAlphabet(length = 4) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * alphabet.length);
      result += alphabet[randomIndex];
    }
    return result;
  }
}
