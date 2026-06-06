import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogCalculateInsertInput } from './dto/log-calculate-insert.input';
import { MomentService } from 'src/utils/MomentService';
import { LogCalculate } from './entity/log-calculate-entity.model';

@Injectable()
export class LogCalculateService {
  constructor(
    @InjectRepository(LogCalculate)
    private readonly logCalculateRepository: Repository<LogCalculate>,

    private momentWrapper: MomentService,
  ) {}

  async insertLogCalculate(_input: LogCalculateInsertInput): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    const logCalculateEntity = new LogCalculate();
    logCalculateEntity.user_id = _input.user_id;
    logCalculateEntity.name = _input.name;
    logCalculateEntity.dob = _input.dob;
    logCalculateEntity.time = _input.time;
    logCalculateEntity.gender = _input.gender;
    logCalculateEntity.createAt = createAt;
    logCalculateEntity.code = this.generateRandomString();
    logCalculateEntity.is_remember_time = _input.is_remember_time;
    logCalculateEntity.place_name = _input.place_name;
    logCalculateEntity.result = JSON.stringify(_input.result);
    const result = await this.logCalculateRepository.save(logCalculateEntity);
    return result;
  }

  async getLogCalculate(code: string, userId: string): Promise<any> {
    const result = await this.logCalculateRepository.findOne({
      where: {
        code: code,
        user_id: userId,
      },
    });

    if (result) {
      return result;
    }

    return null;
  }

  async getLogCalculateNoUser(code: string): Promise<any> {
    const result = await this.logCalculateRepository.findOne({
      where: {
        code: code,
      },
    });

    if (result) {
      return result;
    }

    return null;
  }

  generateRandomString(length = 12): string {
    const characters =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const index = Math.floor(Math.random() * characters.length);
      result += characters[index];
    }
    return result;
  }
}
