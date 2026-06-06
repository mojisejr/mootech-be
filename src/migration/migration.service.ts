import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entity/user-entity.model';
import { UserProvider } from 'src/user-provider/entity/user-provider-entity.model';

@Injectable()
export class MigrationService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProvider)
    private readonly userProviderRepository: Repository<UserProvider>,
  ) {}

  async addUser(_input: any): Promise<any> {
    const users = _input.user;
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(user);
      const user_id = user.user_id;
      const name = user.name;
      const picture_url = user.picture_url;
      const tel = user.tel;
      const email = user.email ? user.email : '';
      const create_at = user.create_at;
      const update_at = user.update_at;
      const surname = user.surname;
      const refer_code = user.refer_code;
      const login_at = user.login_at;
      // no
      const line_id = user.line_id;
      const dob = user.dob;
      const time = user.time;
      const is_remember_time = user.is_remember_time;
      const gender = user.gender;
      // default = ""
      const result_code = user.result_code;
      const place_name = user.place_name;
      const used_point = user.used_point;
      const total_point = user.total_point;
      // default = 1
      const is_refresh = user.is_refresh;
      // default = ""
      const share_img_profile_url = user.share_img_profile_url;

      const userEntity = await this.userRepository.findOne({
        where: {
          user_id: user_id,
        },
      });
      const userId = user_id;
      if (!userEntity) {
        const userInfo = new User();
        userInfo.user_id = user_id;
        userInfo.account_name = name;
        userInfo.name = name;
        userInfo.surname = surname;
        userInfo.picture_url = picture_url;
        userInfo.tel = tel;
        userInfo.email = email;
        userInfo.refer_code = refer_code;
        userInfo.create_at = create_at;
        userInfo.update_at = update_at;
        userInfo.login_at = login_at;
        userInfo.dob = dob;
        userInfo.time = time;
        userInfo.is_remember_time = is_remember_time;
        userInfo.gender = gender;
        userInfo.place_name = place_name;
        userInfo.result_code = result_code;
        userInfo.used_point = used_point;
        userInfo.total_point = total_point;
        userInfo.is_refresh = is_refresh;
        userInfo.share_img_profile_url = share_img_profile_url;
        const resultUser = await this.userRepository.save(userInfo);
        console.log(resultUser);
      }

      // TO PROVIDER
      const userProviderEntity = await this.userProviderRepository.findOne({
        where: {
          user_id: userId,
          provider: 'LINE',
        },
      });

      if (!userProviderEntity) {
        const userProviderInfo = new UserProvider();
        userProviderInfo.user_id = userId;
        userProviderInfo.provider = 'LINE';
        userProviderInfo.name = name;
        userProviderInfo.picture_url = picture_url;
        userProviderInfo.email = email ? email : '';
        userProviderInfo.id_token = line_id;
        userProviderInfo.create_at = create_at;
        userProviderInfo.update_at = update_at;
        const resultUserProvider = await this.userProviderRepository.save(
          userProviderInfo,
        );
        console.log(resultUserProvider);
      }
    }
    return true;
  }

  /*
		"user_id" : "00013139-1d0f-42ef-984d-4dc527ff5251",
		"name" : "Hong🦢",
		"picture_url" : "https:\/\/profile.line-scdn.net\/0hZVJteeTYBXl3DRphkwp6LgpICxQAIwMxD24eFgINXEkJNRcuTz5IGVUOWRtYPEB4GzsdTFtYCRxaIjJELBVMZwBKGjcvRjdKSAIzHhAIDTEtbRBuIDVLXBtSWw4ydAlWNT9DHjN4EBEEVBhtAhw9aQBxAUgKZkZfNDU",
		"tel" : null,
		"email" : null,
		"create_at" : "2026-02-04 21:50:36",
		"update_at" : "2026-02-06 09:19:36",
		"surname" : null,
		"refer_code" : "PYQOSNIBRWSKMQMUOPGK",
		"login_at" : "2026-02-06 09:19:36",
		"line_id" : "U70e2306f38d5f774a7665b5560cc174b",
		"dob" : "2000-07-03",
		"time" : "19:14",
		"is_remember_time" : 1,
		"gender" : "FEMALE",
		"result_code" : "lq2rvER9JLl5",
		"place_name" : "",
		"used_point" : 10,
		"total_point" : 20,
		"is_refresh" : 0,
		"share_img_profile_url" : "https:\/\/s3-ps-cdn.s3.ap-southeast-1.amazonaws.com\/mootech\/share_profile_20260204_215633.jpg"
  */
}
