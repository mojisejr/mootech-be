import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentService } from 'src/utils/MomentService';
import { MemberWithFriend } from './entity/member-with-friend-entity.model';
import { MemberWithFriendService } from './member-with-friend.service';
import { MemberWithFriendController } from './member-with-friend.controller';
import { MemberPaymentModule } from 'src/member-payment/member-payment.module';
import { UserModule } from 'src/user/user.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([MemberWithFriend]),
    MemberPaymentModule,
    forwardRef(() => UserModule),
  ],
  controllers: [MemberWithFriendController],
  providers: [MemberWithFriendService, MomentService],
  exports: [MemberWithFriendService],
})
export class MemberWithFriendModule {}
