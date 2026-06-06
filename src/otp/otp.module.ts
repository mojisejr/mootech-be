import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { MomentService } from 'src/utils/MomentService';
import { OTPService } from './otp.service';
import { OTPController } from './otp.controller';
import { OTP } from './entity/otp-entity.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { SmsSenderModule } from 'src/sms-sender/sms-sender.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OTP]),
    HttpModule,
    SmsSenderModule,
    forwardRef(() => UserModule),
  ],
  providers: [OTPService, MomentService],
  exports: [OTPService],
  controllers: [OTPController],
})
export class OTPModule {}
