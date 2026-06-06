import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserGetInput } from './dto/user-get';
import { UserGetByIdInput } from './dto/user-get-by-id';
import { UserRegisterWithTelInput } from './dto/user-register-with-tel.input';
import { UserGetByTelInput } from './dto/user-get-by-tel';
import { UserVerifyWithTelInput } from './dto/user-verify-with-tel.input';
import { UserRegisterWithLineInput } from './dto/user-register-with-line.input';
import { UserUpdateProfilePicInput } from './dto/user-update-profile-pic';
import { UserRegisterWithGoogleInput } from './dto/user-register-with-google.input';
import { UserRegisterWithEmailInput } from './dto/user-register-with-email.input';
import { UserCheckWithLineInput } from './dto/user-check-with-line.input';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('search')
  @HttpCode(200)
  async getUser(@Query() input: UserGetInput): Promise<any> {
    return await this.userService.getUser(input);
  }

  @Get()
  @HttpCode(200)
  async getUserById(@Query() input: UserGetByIdInput): Promise<any> {
    return await this.userService.getUserById(input);
  }

  @Get('tel')
  @HttpCode(200)
  async getUserByTel(@Query() input: UserGetByTelInput): Promise<any> {
    return await this.userService.getUserByTel(input);
  }

  @Post('check-line')
  @HttpCode(200)
  async checkUserWithLine(@Body() input: UserCheckWithLineInput): Promise<any> {
    return await this.userService.checkUserWithLine(input);
  }

  @Post('register-login')
  @HttpCode(200)
  async registerAndLoginWithEmail(
    @Body() input: UserRegisterWithEmailInput,
  ): Promise<any> {
    return await this.userService.registerOrLogin(input);
  }

  // @Post('register-google')
  // @HttpCode(200)
  // async registerAndLoginWithEmail(
  //   @Body() input: UserRegisterWithEmailInput,
  // ): Promise<any> {
  //   return await this.userService.registerAndLoginWithGoogle(input);
  // }

  @Post('register-tel')
  @HttpCode(200)
  async registerAndLoginWithTel(
    @Body() input: UserRegisterWithTelInput,
  ): Promise<any> {
    return await this.userService.registerAndLoginWithTel(input);
  }

  @Post('register-line')
  @HttpCode(200)
  async registerAndLoginWithLine(
    @Body() input: UserRegisterWithLineInput,
  ): Promise<any> {
    return await this.userService.registerAndLoginWithLine(input);
  }

  @Post('verify-tel')
  @HttpCode(200)
  async verifyOTPWithTel(@Body() input: UserVerifyWithTelInput): Promise<any> {
    return await this.userService.verifyOTPWithTel(input);
  }

  @Put('profile-pic')
  @HttpCode(200)
  async updateProfilePicture(
    @Body() input: UserUpdateProfilePicInput,
  ): Promise<any> {
    return await this.userService.updateProfilePicture(input);
  }
}
