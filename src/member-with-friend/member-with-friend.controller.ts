import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { MemberWithFriendService } from './member-with-friend.service';
import { MemberWithFriendCreateInput } from './dto/member-with-friend-create-input';
import { MemberWithFriendGetInput } from './dto/member-with-friend-get-input';
import { MemberWithFriendGetByIdInput } from './dto/member-with-friend-get-by-id-input';
import { MemberWithFriendUpdateInput } from './dto/member-with-friend-update-input';
import { MemberWithFriendUpdateProfileInput } from './dto/member-with-friend-update-profile-input';

@Controller('member-with-friend')
export class MemberWithFriendController {
  constructor(
    private readonly memberWithFriendService: MemberWithFriendService,
  ) {}

  @Post()
  @HttpCode(200)
  async createMemberWithFriend(
    @Body() input: MemberWithFriendCreateInput,
  ): Promise<any> {
    const result = this.memberWithFriendService.createMemberWithFriend(input);
    return result;
  }

  @Get()
  @HttpCode(200)
  async getMemberWithFriend(
    @Query() input: MemberWithFriendGetInput,
  ): Promise<any> {
    const result = this.memberWithFriendService.getMemberWithFriend(input);
    return result;
  }

  @Get('detail')
  @HttpCode(200)
  async getMemberWithFriendDetail(
    @Query() input: MemberWithFriendGetByIdInput,
  ): Promise<any> {
    const result = this.memberWithFriendService.getMemberWithFriendById(input);
    return result;
  }

  @Get('new-friend')
  @HttpCode(200)
  async getMemberWithFriendNewFriend(
    @Query() input: MemberWithFriendGetByIdInput,
  ): Promise<any> {
    const result =
      this.memberWithFriendService.getMemberWithFriendNewFriend(input);
    return result;
  }

  @Put()
  @HttpCode(200)
  async updateMemberWithFriend(
    @Body() input: MemberWithFriendUpdateInput,
  ): Promise<any> {
    const result = this.memberWithFriendService.updateMemberWithFriend(input);
    return result;
  }

  @Put('profile')
  @HttpCode(200)
  async updateMemberWithFriendProfile(
    @Body() input: MemberWithFriendUpdateProfileInput,
  ): Promise<any> {
    const result =
      this.memberWithFriendService.updateMemberWithFriendProfile(input);
    return result;
  }
}
