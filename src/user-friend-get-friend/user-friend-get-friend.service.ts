import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UserFriendGetFriend } from './entity/user-friend-get-friend-entity.model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MomentService } from 'src/utils/MomentService';
import { UserFriendGetFriendInput } from './dto/user-friend-get-friend.input';
@Injectable()
export class UserFriendGetFriendService {
  constructor(
    @InjectRepository(UserFriendGetFriend)
    private readonly userFriendGetFriendRepository: Repository<UserFriendGetFriend>,
    private momentWrapper: MomentService,
  ) {}

  async insertUserFriendGetFriend(
    _input: UserFriendGetFriendInput,
  ): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');

    const userNewEntity = new UserFriendGetFriend();
    userNewEntity.user_id = _input.user_id;
    userNewEntity.refer_user_id = _input.refer_user_id;
    userNewEntity.create_at = createAt;
    const result = await this.userFriendGetFriendRepository.save(userNewEntity);
    return result;
  }

  async getUserFriendGetFriend(_input: UserFriendGetFriendInput): Promise<any> {
    const userNewEntity = await this.userFriendGetFriendRepository.findOne({
      where: {
        user_id: _input.user_id,
      },
    });
    return userNewEntity;
  }

  async getUserFriendGetFriendTotal(
    _input: UserFriendGetFriendInput,
  ): Promise<any> {
    const userNewEntity = await this.userFriendGetFriendRepository.find({
      where: {
        refer_user_id: _input.user_id,
      },
    });
    return userNewEntity.length;
  }
}
