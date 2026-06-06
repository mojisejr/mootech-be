import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentService } from 'src/utils/MomentService';
import { User } from './entity/user-entity.model';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { OTPModule } from 'src/otp/otp.module';
import { SmsSenderModule } from 'src/sms-sender/sms-sender.module';
import { UserFriendGetFriendModule } from 'src/user-friend-get-friend/user-friend-get-friend.module';
import { LogActivityModule } from 'src/log-activity/log-activity.module';
import { UserProviderModule } from 'src/user-provider/user-provider.module';
import { ObjectStorageModule } from 'src/object-storage/object-storage.module';
import { MemberWithFriendModule } from 'src/member-with-friend/member-with-friend.module';
import { LineMessageModule } from 'src/line-message/line.message.module';
import { MemberPaymentModule } from 'src/member-payment/member-payment.module';
import { FortuneTellingModule } from 'src/fortune-telling/fortune-telling.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    SmsSenderModule,
    UserFriendGetFriendModule,
    forwardRef(() => OTPModule),
    LogActivityModule,
    UserProviderModule,
    forwardRef(() => ObjectStorageModule),
    LineMessageModule,
    MemberPaymentModule,
    FortuneTellingModule,
    forwardRef(() => MemberWithFriendModule),
  ],
  controllers: [UserController],
  providers: [UserService, MomentService],
  exports: [UserService],
})
export class UserModule {}
