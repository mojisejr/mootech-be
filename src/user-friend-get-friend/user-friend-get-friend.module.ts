import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentService } from 'src/utils/MomentService';
import { UserFriendGetFriend } from './entity/user-friend-get-friend-entity.model';
import { UserFriendGetFriendService } from './user-friend-get-friend.service';
@Module({
  imports: [TypeOrmModule.forFeature([UserFriendGetFriend])],
  controllers: [],
  providers: [UserFriendGetFriendService, MomentService],
  exports: [UserFriendGetFriendService],
})
export class UserFriendGetFriendModule {}
