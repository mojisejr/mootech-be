import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user-entity.model';
import { MomentService } from 'src/utils/MomentService';
import { UserRegisterWithTelInput } from './dto/user-register-with-tel.input';
import { UserGetInput } from './dto/user-get';
import { UserGetByIdInput } from './dto/user-get-by-id';
import { UserGetByTelInput } from './dto/user-get-by-tel';
import { OTPService } from 'src/otp/otp.service';
import { SmsSenderService } from 'src/sms-sender/sms-sender.service';
import { OTPVerifyInput } from 'src/otp/dto/otp-verify.input';
import { UserVerifyWithTelInput } from './dto/user-verify-with-tel.input';
import { UserRegisterWithLineInput } from './dto/user-register-with-line.input';
import { UserUpdateInfoInput } from './dto/user-update-info';
import { UserFriendGetFriendService } from 'src/user-friend-get-friend/user-friend-get-friend.service';
import { LogActivityService } from 'src/log-activity/log-activity.service';
import { UserUpdateProfilePicInput } from './dto/user-update-profile-pic';
import { UserUpdateProfileShareInput } from './dto/user-update-profile-share';
import { UserProviderService } from 'src/user-provider/user-provider.service';
import { UserProviderGetByEmailInput } from 'src/user-provider/dto/user-provider-get-by-email.input';
import { PROVIDER } from 'src/constants/user-provider';
import { UserProviderRegisterInput } from 'src/user-provider/dto/user-provider-register.input';
import { UserProvidersGetByTokenInput } from 'src/user-provider/dto/user-provider-get-by-token.input';
import { UserCheckWithLineInput } from './dto/user-check-with-line.input';
import { UserRegisterWithEmailInput } from './dto/user-register-with-email.input';
import { UserProvidersGetByEmailInput } from 'src/user-provider/dto/user-providers-get-by-email.input';
import { ObjectStorageService } from 'src/object-storage/object-storage.service';
import { MemberWithFriendService } from 'src/member-with-friend/member-with-friend.service';
import { MemberWithFriendRegisteredCreateInput } from 'src/member-with-friend/dto/member-with-friend-registered-create-input';
import { LineMessageService } from 'src/line-message/line-message.service';
import { MemberPaymentService } from 'src/member-payment/member-payment.service';
import { FortuneTellingService } from 'src/fortune-telling/fortune-telling.service';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(forwardRef(() => OTPService))
    private readonly oTPService: OTPService,
    @Inject(forwardRef(() => MemberWithFriendService))
    private readonly memberWithFriendService: MemberWithFriendService,
    private smsSenderService: SmsSenderService,
    private userFriendGetFriendService: UserFriendGetFriendService,
    private momentWrapper: MomentService,
    private logActivityService: LogActivityService,
    private userProviderService: UserProviderService,
    private objectStorageService: ObjectStorageService,
    private lineMessageService: LineMessageService,
    private memberPaymentService: MemberPaymentService,
    private fortuneTellingService: FortuneTellingService,
  ) {}

  async registerAndLoginWithEmail(
    _input: UserRegisterWithEmailInput,
  ): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');

    // CHECK
    const userProvider = await this.userProviderService.getProviderByEmail({
      email: _input.email,
      provider: _input.provider,
    } as UserProviderGetByEmailInput);

    if (!userProvider) {
      // NEW
      const users = await this.userProviderService.getProvidersByEmail({
        email: _input.email,
      } as UserProvidersGetByEmailInput);

      let userId = null;
      if (users) {
        // HAS
        userId = users.user_id;
      } else {
        // NEWEST
        let isUpdateReferCode = false;
        let result = null;
        const userEntity = new User();
        userEntity.create_at = createAt;
        userEntity.refer_code = this.generateRandomAlphabet(20);
        userEntity.name = _input.name;
        userEntity.dob = '';
        userEntity.is_remember_time = false;
        userEntity.time = '';
        userEntity.place_name = '';
        userEntity.picture_url = _input.image;
        userEntity.result_code = '';
        userEntity.share_img_profile_url = '';
        if (_input.refer_code && _input.refer_code != '') {
          isUpdateReferCode = true;
        }
        if (!userEntity.name || userEntity.name == '') {
          userEntity.name = _input.name;
        }

        userEntity.update_at = createAt;
        userEntity.login_at = createAt;
        result = await this.userRepository.save(userEntity);
        userId = result.user_id;
        if (isUpdateReferCode == true) {
          try {
            await this.checkReferCode(result.user_id, _input.refer_code);
          } catch (e) {}
        }
        // LOG POINTS
        await this.logActivityService.insertLogActivity({
          user_id: result.user_id,
          activity_id: 1,
          create_at: createAt,
          point: 20,
        });
        return { is_user_new: true, is_email: true };
      }

      // CREATE PROVIDER
      await this.userProviderService.createUserProvider({
        user_id: userId,
        image: _input.image,
        email: _input.email,
        name: _input.name,
        provider: _input.provider,
        id_token: _input.idToken,
      } as UserProviderRegisterInput);
    } else {
      // EXITS
      return { is_user_new: false, is_email: true };
    }
  }

  async registerAndLoginWithTel(
    _input: UserRegisterWithTelInput,
  ): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');

    let userEntity = await this.userRepository.findOne({
      where: {
        tel: _input.tel,
      },
    });

    let result = null;

    if (userEntity) {
      userEntity.update_at = createAt;
      if (userEntity.name == '') {
        userEntity.name = _input.name;
      }
      if (userEntity.surname == '') {
        userEntity.surname = _input.surname;
      }
      if (userEntity.refer_code == '') {
        userEntity.refer_code = this.generateRandomAlphabet(10);
      }
      result = await this.userRepository.save(userEntity);
    } else {
      userEntity = new User();
      userEntity.tel = _input.tel;
      userEntity.name = _input.name;
      userEntity.surname = _input.surname;
      userEntity.refer_code = this.generateRandomAlphabet(10);
      userEntity.create_at = createAt;
      userEntity.update_at = createAt;
      result = await this.userRepository.save(userEntity);
    }
    return {
      is_new: userEntity && userEntity.name != '' ? false : true,
      ...result,
    };
  }

  async checkUserWithLine(_input: UserCheckWithLineInput): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    const userProviderEntity =
      await this.userProviderService.getProviderByToken({
        token: _input.line_id,
        provider: PROVIDER.LINE,
      } as UserProvidersGetByTokenInput);
    if (userProviderEntity) {
      if (userProviderEntity.email && userProviderEntity.email != '') {
        const user = await this.userRepository.findOne({
          where: {
            user_id: userProviderEntity.user_id,
          },
        });
        console.log(user);
        let isEmail = false;
        if (user.email && user.email != '') {
          isEmail = true;
        }
        if (!user.name || user.name == '') {
          // GO TO FORM
          return {
            is_user_new: false,
            is_email: isEmail,
            is_info: false,
            user_id: user.user_id,
            name: user.name,
            ref_code: user.refer_code,
            picture_url: user.picture_url,
            is_refresh: user.is_refresh,
            result_code: user.result_code,
            email: user.email,
          };
        } else {
          // GO TO PROFILE : SUCCESS
          return {
            is_user_new: false,
            is_email: isEmail,
            is_info: true,
            user_id: user.user_id,
            name: user.name,
            ref_code: user.refer_code,
            picture_url: user.picture_url,
            is_refresh: user.is_refresh,
            result_code: user.result_code,
            email: user.email,
          };
        }
      } else {
        // GO TO ENTER EMAIL
        return {
          is_user_new: false,
          is_email: false,
          is_info: false,
          user_id: null,
          name: null,
          ref_code: null,
          picture_url: null,
          is_refresh: null,
          result_code: null,
          email: null,
        };
      }
    } else {
      // NEW USER
      // GO TO ENTER EMAIL
      return {
        is_user_new: true,
        is_email: false,
        is_info: false,
        user_id: null,
        name: null,
        ref_code: null,
        picture_url: null,
        is_refresh: null,
        result_code: null,
        email: null,
      };
    }
  }

  async registerOrLogin(_input: UserRegisterWithEmailInput): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');

    const email = _input.email;
    const idToken = _input.idToken;
    const refCode = _input.refer_code;
    const name = _input.name;
    const provider = _input.provider;
    const image = _input.image;

    console.log('registerOrLogin _input', _input);

    // 1. CHECK PROVIDER
    const userProviderByProvider =
      await this.userProviderService.getProviderByToken({
        token: idToken,
        provider: provider,
      } as UserProvidersGetByTokenInput);
    console.log('STEP1:', userProviderByProvider);

    if (provider == 'LINE') {
      const resultLine = await this.lineMessageService.checkUserId(idToken);
      console.log('resultLine:', resultLine);
      if (resultLine.ok == false) {
        return resultLine;
      }
    }

    if (userProviderByProvider) {
      console.log('HAVE - userProviderByProvider:', userProviderByProvider);
      // - HAVE
      if (provider != 'LINE') {
        if (email != '') {
          // UPDATE EMAIL;
          await this.userProviderService.updateUserProvider(
            idToken,
            email,
            provider,
          );
        }
      }

      const user = await this.userRepository.findOne({
        where: {
          user_id: userProviderByProvider.user_id,
        },
      });
      console.log('HAVE - user:', user);
      if (user) {
        console.log('HAVE - user - HAVE:', user);
        if (provider != 'LINE' && email != '') {
          user.email = email;
          const r = await this.userRepository.save(user);
          console.log('result:', r);
        } else {
          try {
            const resultS3 =
              await this.objectStorageService.downloadLineImageToS3(
                _input.image,
              );
            if (resultS3 && resultS3.s3Response) {
              user.picture_url = resultS3.s3Response.Location;
            }
          } catch (e: any) {}
          const r = await this.userRepository.save(user);
          console.log('result line:', r);
        }
        if (refCode && refCode != '') {
          try {
            await this.addFriend(user.user_id, _input.refer_code, user);
          } catch (e) {}
        }

        if (!user.name || user.name == '') {
          console.log('HAVE - user GO TO FORM:');
          // GO TO FORM
          return {
            is_user_new: false,
            is_email: true,
            is_info: false,
            user_id: user.user_id,
            name: user.name,
            ref_code: user.refer_code,
            picture_url: user.picture_url,
            is_refresh: user.is_refresh,
            result_code: user.result_code,
          };
        } else {
          // GO TO PROFILE : SUCCESS
          console.log('HAVE - user GO TO PROFILE:');
          return {
            is_user_new: false,
            is_email: true,
            is_info: true,
            user_id: user.user_id,
            name: user.name,
            ref_code: user.refer_code,
            picture_url: user.picture_url,
            is_refresh: user.is_refresh,
            result_code: user.result_code,
          };
        }
      } else {
        // FORM
        console.log('HAVE - user - NO HAVE:');
        // if (refCode && refCode != '') {
        //   try {
        //     await this.addFriend(user.user_id, _input.refer_code, user);
        //   } catch (e) {}
        // }
        return {
          is_user_new: true,
          is_email: true,
          is_info: false,
          user_id: user.user_id,
          name: user.name,
          ref_code: user.refer_code,
          picture_url: user.picture_url,
          is_refresh: user.is_refresh,
          result_code: user.result_code,
        };
      }
    } else {
      // - NO HAVE
      console.log('NO HAVE - userProviderByProvider:');
      let usersEmails = null;
      if (provider != 'LINE') {
        usersEmails = await this.userProviderService.getProvidersByEmail({
          email: email,
        });
      } else {
        usersEmails = await this.userProviderService.getProviderByToken({
          token: idToken,
          provider: provider,
        });
      }

      console.log('NO HAVE - usersEmails:', usersEmails);

      if (usersEmails) {
        console.log('NO HAVE - usersEmails - OTHER:', usersEmails);
        // HAVE OTHER
        // CREATE PROVIDER
        let imageProfile = '';
        try {
          const resultS3 =
            await this.objectStorageService.downloadLineImageToS3(_input.image);
          if (resultS3 && resultS3.s3Response) {
            imageProfile = resultS3.s3Response.Location;
          }
        } catch (e: any) {}

        await this.userProviderService.createUserProvider({
          user_id: usersEmails.user_id,
          image: imageProfile,
          email: email,
          name: name,
          provider: provider,
          id_token: idToken,
        } as UserProviderRegisterInput);
        const user = await this.userRepository.findOne({
          where: {
            user_id: usersEmails.user_id,
          },
        });
        if (user) {
          user.email = email;
          const r = await this.userRepository.save(user);
          console.log('result:', r);
          if (refCode && refCode != '') {
            try {
              await this.addFriend(user.user_id, _input.refer_code, user);
            } catch (e) {}
          }

          if (!user.name || user.name == '') {
            // GO TO FORM
            return {
              is_user_new: false,
              is_email: true,
              is_info: false,
              user_id: user.user_id,
              name: user.name,
              ref_code: user.refer_code,
              picture_url: user.picture_url,
              is_refresh: user.is_refresh,
              result_code: user.result_code,
            };
          } else {
            if (refCode && refCode != '') {
              try {
                await this.addFriend(user.user_id, _input.refer_code, user);
              } catch (e) {}
            }
            // GO TO PROFILE : SUCCESS
            return {
              is_user_new: false,
              is_email: true,
              is_info: true,
              user_id: user.user_id,
              name: user.name,
              ref_code: user.refer_code,
              picture_url: user.picture_url,
              is_refresh: user.is_refresh,
              result_code: user.result_code,
            };
          }
        } else {
          // FORM
          return {
            is_user_new: true,
            is_email: true,
            is_info: false,
            user_id: null,
            name: null,
            ref_code: null,
            picture_url: null,
            is_refresh: null,
            result_code: null,
          };
        }
      } else {
        console.log('NO HAVE - usersEmails - FIRST TIME:');
        let imageProfile = '';
        try {
          const resultS3 =
            await this.objectStorageService.downloadLineImageToS3(_input.image);
          if (resultS3 && resultS3.s3Response) {
            imageProfile = resultS3.s3Response.Location;
          }
        } catch (e: any) {}
        // NEWLY - FIRST
        // CREATE USER:
        let isUpdateReferCode = false;
        const userEntity = new User();
        userEntity.create_at = createAt;
        userEntity.refer_code = this.generateRandomAlphabet(20);
        userEntity.name = name;
        userEntity.dob = '';
        userEntity.is_remember_time = false;
        userEntity.time = '';
        userEntity.place_name = '';
        userEntity.picture_url = imageProfile;
        userEntity.email = email ? email : '';
        userEntity.result_code = '';
        userEntity.share_img_profile_url = '';
        if (refCode && refCode != '') {
          isUpdateReferCode = true;
        }
        userEntity.update_at = createAt;
        userEntity.login_at = createAt;
        console.log('userEntity: ', userEntity);
        const result = await this.userRepository.save(userEntity);
        console.log('result: ', result);
        if (refCode && refCode != '') {
          try {
            await this.checkReferCode(result.user_id, _input.refer_code);
          } catch (e) {}
          try {
            await this.addFriend(result.user_id, _input.refer_code, result);
          } catch (e) {}
        }
        // CREATE PROVIDER
        await this.userProviderService.createUserProvider({
          user_id: result.user_id,
          image: imageProfile,
          email: email ? email : '',
          name: name,
          provider: provider,
          id_token: idToken,
        } as UserProviderRegisterInput);
        await this.logActivityService.insertLogActivity({
          user_id: result.user_id,
          activity_id: 1,
          create_at: createAt,
          point: 20,
        });
        return {
          is_user_new: true,
          is_email: email != '',
          is_info: false,
          user_id: result.user_id,
          name: result.name,
          ref_code: result.refer_code,
          picture_url: result.picture_url,
          is_refresh: result.is_refresh,
          result_code: result.result_code,
        };
      }
    }

    // let userEntity = await this.userRepository.findOne({
    //   where: {
    //     line_id: _input.line_id,
    //   },
    // });
    // let result = null;
    // let isUpdateReferCode = false;
    // if (!userEntity) {
    //   userEntity = new User();
    //   userEntity.create_at = createAt;
    //   userEntity.refer_code = this.generateRandomAlphabet(20);
    //   userEntity.name = _input.name;
    //   userEntity.line_id = _input.line_id;
    //   userEntity.dob = '';
    //   userEntity.is_remember_time = false;
    //   userEntity.time = '';
    //   userEntity.place_name = '';
    //   userEntity.picture_url = _input.picture_url;
    //   userEntity.result_code = '';
    //   userEntity.share_img_profile_url = '';
    //   if (_input.refer_code && _input.refer_code != '') {
    //     isUpdateReferCode = true;
    //   }
    // } else {
    //   isNew = false;
    // }
    // if (!userEntity.name || userEntity.name == '') {
    //   userEntity.name = _input.name;
    // }
    // userEntity.update_at = createAt;
    // userEntity.login_at = createAt;
    // result = await this.userRepository.save(userEntity);
    // if (isUpdateReferCode == true) {
    //   await this.checkReferCode(result.user_id, _input.refer_code);
    // }
    // if (isNew == true) {
    //   // LOG POINTS
    //   await this.logActivityService.insertLogActivity({
    //     user_id: result.user_id,
    //     activity_id: 1,
    //     create_at: createAt,
    //     point: 20,
    //   });
    // }
    // return {
    //   is_new: userEntity && userEntity.name != '' ? false : true,
    //   ...result,
    // };
  }

  async registerAndLoginWithLine(
    _input: UserRegisterWithLineInput,
  ): Promise<any> {
    // const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    // let isNew = true;
    // let userEntity = await this.userRepository.findOne({
    //   where: {
    //     line_id: _input.line_id,
    //   },
    // });
    // let result = null;
    // let isUpdateReferCode = false;
    // if (!userEntity) {
    //   userEntity = new User();
    //   userEntity.create_at = createAt;
    //   userEntity.refer_code = this.generateRandomAlphabet(20);
    //   userEntity.name = _input.name;
    //   userEntity.line_id = _input.line_id;
    //   userEntity.dob = '';
    //   userEntity.is_remember_time = false;
    //   userEntity.time = '';
    //   userEntity.place_name = '';
    //   userEntity.picture_url = _input.picture_url;
    //   userEntity.result_code = '';
    //   userEntity.share_img_profile_url = '';
    //   if (_input.refer_code && _input.refer_code != '') {
    //     isUpdateReferCode = true;
    //   }
    // } else {
    //   isNew = false;
    // }
    // if (!userEntity.name || userEntity.name == '') {
    //   userEntity.name = _input.name;
    // }
    // userEntity.update_at = createAt;
    // userEntity.login_at = createAt;
    // result = await this.userRepository.save(userEntity);
    // if (isUpdateReferCode == true) {
    //   await this.checkReferCode(result.user_id, _input.refer_code);
    // }
    // if (isNew == true) {
    //   // LOG POINTS
    //   await this.logActivityService.insertLogActivity({
    //     user_id: result.user_id,
    //     activity_id: 1,
    //     create_at: createAt,
    //     point: 20,
    //   });
    // }
    // return {
    //   is_new: userEntity && userEntity.name != '' ? false : true,
    //   ...result,
    // };
  }

  // async registerAndLoginWithLine(
  //   _input: UserRegisterWithLineInput,
  // ): Promise<any> {
  //   const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
  //   let isNew = true;
  //   let userEntity = await this.userRepository.findOne({
  //     where: {
  //       line_id: _input.line_id,
  //     },
  //   });

  //   let result = null;

  //   let isUpdateReferCode = false;

  //   if (!userEntity) {
  //     userEntity = new User();
  //     userEntity.create_at = createAt;
  //     userEntity.refer_code = this.generateRandomAlphabet(20);
  //     userEntity.name = _input.name;
  //     userEntity.line_id = _input.line_id;
  //     userEntity.dob = '';
  //     userEntity.is_remember_time = false;
  //     userEntity.time = '';
  //     userEntity.place_name = '';
  //     userEntity.picture_url = _input.picture_url;
  //     userEntity.result_code = '';
  //     userEntity.share_img_profile_url = '';

  //     if (_input.refer_code && _input.refer_code != '') {
  //       isUpdateReferCode = true;
  //     }
  //   } else {
  //     isNew = false;
  //   }
  //   if (!userEntity.name || userEntity.name == '') {
  //     userEntity.name = _input.name;
  //   }
  //   userEntity.update_at = createAt;
  //   userEntity.login_at = createAt;
  //   result = await this.userRepository.save(userEntity);

  //   if (isUpdateReferCode == true) {
  //     await this.checkReferCode(result.user_id, _input.refer_code);
  //   }

  //   if (isNew == true) {
  //     // LOG POINTS
  //     await this.logActivityService.insertLogActivity({
  //       user_id: result.user_id,
  //       activity_id: 1,
  //       create_at: createAt,
  //       point: 20,
  //     });
  //   }
  //   return {
  //     is_new: userEntity && userEntity.name != '' ? false : true,
  //     ...result,
  //   };
  // }

  async verifyOTPWithTel(_input: UserVerifyWithTelInput): Promise<any> {
    // VERIFY
    const resultOTP = await this.oTPService.verifyOTP({
      otp: _input.otp,
      ref_code: _input.ref_code,
    } as OTPVerifyInput);
    return resultOTP;
  }

  async getUserById(_input: UserGetByIdInput): Promise<any> {
    const result = await this.userRepository.findOne({
      where: {
        user_id: _input.user_id,
      },
    });
    if (!result) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'User not found.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const totalMember = await this.memberWithFriendService.getMemberWithFriend({
      user_id: _input.user_id,
    });

    const memberPayment = await this.memberPaymentService.getMemberPayment({
      user_id: _input.user_id,
    });

    const totalLimitFortune = this.fortuneTellingService.getLimit(
      !memberPayment,
    );
    const totalFortune = await this.fortuneTellingService.getFortuneStickTotal(
      _input.user_id,
    );

    return {
      ...result,
      payment: {
        ...memberPayment,
        total_friend: totalMember.length,
        limit_friend: this.memberWithFriendService.getLimit(!memberPayment),
        limit_fortune: totalLimitFortune,
        total_fortune: totalFortune,
        is_not_expired: this.isNotExpired(
          memberPayment ? memberPayment.expire_at : null,
        ),
      },
    };
  }

  async getUserByTel(_input: UserGetByTelInput): Promise<any> {
    const result = await this.userRepository.findOne({
      where: {
        tel: _input.tel,
      },
    });
    if (!result) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'User not found.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return result;
  }

  async getUserId(userId: string): Promise<any> {
    const result = await this.userRepository.findOne({
      where: {
        user_id: userId,
      },
    });
    return result;
  }

  async getUser(_input: UserGetInput): Promise<any> {
    const result = await this.userRepository.find();
    return result;
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

  async updateInfo(_input: UserUpdateInfoInput): Promise<any> {
    const result = await this.userRepository.findOne({
      where: {
        user_id: _input.user_id,
      },
    });

    if (result) {
      result.dob = _input.dob;
      result.time = _input.time;
      result.is_remember_time = _input.is_remember_time;
      result.gender = _input.gender;
      result.result_code = _input.result_code;
      result.place_name = _input.place_name;
      result.is_refresh = false;

      result.name = _input.name;
      result.surname = _input.surname;
      result.picture_url = _input.picture_url;
      result.account_name = _input.account_name;
      console.log('updateInfo:', result);
      await this.userRepository.save(result);
    }

    return result;
  }

  async updateWorkVibes(user_id: string): Promise<any> {
    const result = await this.userRepository.findOne({
      where: {
        user_id: user_id,
      },
    });

    if (result) {
      result.used_point = result.used_point + 10;
      await this.userRepository.save(result);

      // LOG POINTS
      const createAt = this.momentWrapper
        .moment()
        .format('YYYY-MM-DD HH:mm:ss');
      await this.logActivityService.insertLogActivity({
        user_id: result.user_id,
        activity_id: 3,
        create_at: createAt,
        point: -10,
      });
    }

    return result;
  }

  async updateLoveMate(user_id: string): Promise<any> {
    const result = await this.userRepository.findOne({
      where: {
        user_id: user_id,
      },
    });

    if (result) {
      result.used_point = result.used_point + 10;
      await this.userRepository.save(result);

      // LOG POINTS
      const createAt = this.momentWrapper
        .moment()
        .format('YYYY-MM-DD HH:mm:ss');
      await this.logActivityService.insertLogActivity({
        user_id: result.user_id,
        activity_id: 2,
        create_at: createAt,
        point: -10,
      });
    }

    return result;
  }

  async updateProfilePicture(input: UserUpdateProfilePicInput): Promise<any> {
    const result = await this.userRepository.findOne({
      where: {
        user_id: input.user_id,
      },
    });

    if (result) {
      const createAt = this.momentWrapper
        .moment()
        .format('YYYY-MM-DD HH:mm:ss');
      result.picture_url = input.url;
      result.update_at = createAt;
      await this.userRepository.save(result);
    }

    return result;
  }

  async updateShareUrlProfile(
    input: UserUpdateProfileShareInput,
  ): Promise<any> {
    console.log('updateShareUrlProfile:');
    console.log(input);
    const result = await this.userRepository.findOne({
      where: {
        user_id: input.user_id,
      },
    });

    if (result) {
      const createAt = this.momentWrapper
        .moment()
        .format('YYYY-MM-DD HH:mm:ss');
      result.share_img_profile_url = input.url;
      result.update_at = createAt;
      await this.userRepository.save(result);
    }

    return result;
  }

  async checkReferCode(user_id: string, refer_code: string): Promise<any> {
    const resultReferCode = await this.userRepository.findOne({
      where: {
        refer_code: refer_code,
      },
    });

    if (!resultReferCode) {
      // NO REFER CODE
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'No REFER CODE',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const user_refer_id = resultReferCode.user_id;

    const resultFGF =
      await this.userFriendGetFriendService.getUserFriendGetFriend({
        user_id: user_id,
        refer_user_id: user_refer_id,
      });

    if (resultFGF) {
      // YOU REGISTER WITH REFER CODE EXIT
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'You registered with refer code.',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.userFriendGetFriendService.insertUserFriendGetFriend({
      user_id: user_id,
      refer_user_id: user_refer_id,
    });

    // UPDATE INFO REFER REFER
    const totalFriend =
      await this.userFriendGetFriendService.getUserFriendGetFriendTotal({
        user_id: user_refer_id,
        refer_user_id: user_refer_id,
      });
    const updateNum = totalFriend > 0 && totalFriend % 3 == 0 ? 10 : 1;
    // UPDATE
    const newPoint = resultReferCode.total_point + updateNum;
    resultReferCode.total_point = newPoint;
    await this.userRepository.save(resultReferCode);

    // LOG POINTS
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    await this.logActivityService.insertLogActivity({
      user_id: resultReferCode.user_id,
      activity_id: 4,
      create_at: createAt,
      point: newPoint,
    });
    return true;
  }

  // ADD FRIEND AUTOMATIC
  async addFriend(
    user_id: string,
    refer_code: string,
    newUserInfo: User,
  ): Promise<any> {
    console.log('addFriend');
    const resultReferCode = await this.userRepository.findOne({
      where: {
        refer_code: refer_code,
      },
    });

    if (!resultReferCode) {
      // NO REFER CODE
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'No REFER CODE',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    console.log('addFriend', resultReferCode);
    const user_refer_id = resultReferCode.user_id;
    if (user_refer_id != user_id) {
      // GET
      const r =
        await this.memberWithFriendService.createMemberWithFriendRegistered({
          user_id: user_id,
          dob: resultReferCode.dob,
          time: resultReferCode.time,
          gender: resultReferCode.gender,
          is_remember_time: resultReferCode.is_remember_time,
          name: resultReferCode.name,
          surname: resultReferCode.surname,
          picture_url: resultReferCode.picture_url,
          member_id: resultReferCode.user_id,
        } as MemberWithFriendRegisteredCreateInput);

      console.log('addFriend result', r);
      const r2 =
        await this.memberWithFriendService.createMemberWithFriendRegistered({
          user_id: resultReferCode.user_id,
          dob: newUserInfo.dob,
          time: newUserInfo.time,
          gender: newUserInfo.gender,
          is_remember_time: newUserInfo.is_remember_time,
          name: newUserInfo.name,
          surname: newUserInfo.surname,
          picture_url: newUserInfo.picture_url,
          member_id: user_id,
        } as MemberWithFriendRegisteredCreateInput);
      console.log('addFriend result', r2);
    }
    return true;
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
