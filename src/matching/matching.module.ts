import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogMatching } from './entity/log-matching-entity.model';
import { UserMatching } from './entity/matching-entity.model';
import { MatchingService } from './matching.service';
import { UserModule } from 'src/user/user.module';
import { MemberWithFriendModule } from 'src/member-with-friend/member-with-friend.module';
import { ChineseHoroscopeModule } from 'src/chinese-horoscope/chinese-horoscope.module';
import { UserMatchingController } from './matching.controller';
import { MomentService } from 'src/utils/MomentService';
import { MemberPaymentModule } from 'src/member-payment/member-payment.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([UserMatching, LogMatching]),
    UserModule,
    MemberWithFriendModule,
    ChineseHoroscopeModule,
    MemberPaymentModule,
  ],
  controllers: [UserMatchingController],
  providers: [MatchingService, MomentService],
  exports: [MatchingService],
})
export class MatchingModule {}
