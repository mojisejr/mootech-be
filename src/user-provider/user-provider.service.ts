import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MomentService } from 'src/utils/MomentService';
import { UserProvider } from './entity/user-provider-entity.model';
import { UserProviderRegisterInput } from './dto/user-provider-register.input';
import { UserProviderGetByEmailInput } from './dto/user-provider-get-by-email.input';
import { UserProviderGetByUserIdInput } from './dto/user-provider-get-by-user-id.input';
import { UserProvidersGetByUserInput } from './dto/user-provider-get-by-user.input';
import { UserProvidersGetByTokenInput } from './dto/user-provider-get-by-token.input';
import { UserProvidersGetByEmailInput } from './dto/user-providers-get-by-email.input';
@Injectable()
export class UserProviderService {
  constructor(
    @InjectRepository(UserProvider)
    private readonly userProviderRepository: Repository<UserProvider>,
    private momentWrapper: MomentService,
  ) {}

  async createUserProvider(_input: UserProviderRegisterInput): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');

    let userEntity = null;
    if (_input.provider == 'EMAIL') {
      userEntity = await this.userProviderRepository.findOne({
        where: {
          email: _input.email,
          provider: _input.provider,
        },
      });
    } else {
      userEntity = await this.userProviderRepository.findOne({
        where: {
          id_token: _input.id_token,
          provider: _input.provider,
        },
      });
    }

    // EXITS USER
    if (userEntity) {
      userEntity.update_at = createAt;
      const result = await this.userProviderRepository.save(userEntity);
      return { is_new: false };
    } else {
      const userNewEntity = new UserProvider();
      userNewEntity.create_at = createAt;
      userNewEntity.update_at = createAt;
      userNewEntity.email = _input.email;
      userNewEntity.picture_url = _input.image;
      userNewEntity.name = _input.name;
      userNewEntity.id_token = _input.id_token;
      userNewEntity.user_id = _input.user_id;
      userNewEntity.provider = _input.provider;
      const r = await this.userProviderRepository.save(userNewEntity);
      console.log('createUserProvider', r);
      return { is_new: true };
    }
  }

  async getProviderByEmail(_input: UserProviderGetByEmailInput): Promise<any> {
    const userEntity = await this.userProviderRepository.findOne({
      where: {
        email: _input.email,
        provider: _input.provider,
      },
    });
    return userEntity;
  }

  async getProviderByUser(_input: UserProviderGetByUserIdInput): Promise<any> {
    const userEntity = await this.userProviderRepository.findOne({
      where: {
        email: _input.user_id,
        provider: _input.provider,
      },
    });
    return userEntity;
  }

  async getProviderByToken(_input: UserProvidersGetByTokenInput): Promise<any> {
    const userEntity = await this.userProviderRepository.findOne({
      where: {
        id_token: _input.token,
        provider: _input.provider,
      },
    });
    return userEntity;
  }

  async getProvidersByUser(_input: UserProvidersGetByUserInput): Promise<any> {
    const userEntity = await this.userProviderRepository.findOne({
      where: {
        user_id: _input.user_id,
      },
    });
    return userEntity;
  }

  async getProvidersByEmail(
    _input: UserProvidersGetByEmailInput,
  ): Promise<any> {
    const userEntity = await this.userProviderRepository.findOne({
      where: {
        email: _input.email,
      },
    });
    return userEntity;
  }

  async updateUserProvider(
    idToken: string,
    email: string,
    provider: string,
  ): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    const userEntity = await this.userProviderRepository.findOne({
      where: {
        id_token: idToken,
        provider: provider,
      },
    });

    if (userEntity) {
      userEntity.email = email;
      userEntity.update_at = createAt;
      await this.userProviderRepository.save(userEntity);
    }

    return userEntity;
  }

  async getUserProviderCreateAt(day: number): Promise<any> {
    const today = this.momentWrapper.moment().format('YYYY-MM-DD');

    const qb = this.userProviderRepository
      .createQueryBuilder('user_provider')
      .where('user_provider.provider = :provider', { provider: 'LINE' })
      // ✅ เงื่อนไขใหม่
      .andWhere('DATEDIFF(:today, DATE(user_provider.create_at)) <= :day', {
        today,
        day,
      })

      .select(['user_provider']);

    const result = await qb.getRawMany();
    return result;
  }
}
