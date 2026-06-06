import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MomentService } from 'src/utils/MomentService';
import { LogLoveMate } from './entity/log-love-mate-entity.model';
import { LogLoveMateInsertInput } from './dto/log-love-mate-insert.input';
import { LogLoveMateCheckInput } from './dto/log-love-mate-check.input';

@Injectable()
export class LogWoLoveMateService {
  constructor(
    @InjectRepository(LogLoveMate)
    private readonly logLoveMateRepository: Repository<LogLoveMate>,

    private momentWrapper: MomentService,
  ) {}

  async insertLogLoveMate(_input: LogLoveMateInsertInput): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    const logCalculateEntity = new LogLoveMate();
    logCalculateEntity.user_id = _input.user_id;
    logCalculateEntity.createAt = createAt;
    logCalculateEntity.name = _input.name;
    logCalculateEntity.dob = _input.dob;
    logCalculateEntity.time = _input.time;
    logCalculateEntity.is_remember_time = _input.time && _input.time != '';
    logCalculateEntity.gender = _input.gender;

    logCalculateEntity.your_name = _input.your_name;
    logCalculateEntity.your_dob = _input.your_dob;
    logCalculateEntity.your_time = _input.your_time;
    logCalculateEntity.your_is_remember_time =
      _input.your_time && _input.your_time != '';
    logCalculateEntity.your_gender = _input.your_gender;

    logCalculateEntity.result = JSON.stringify(_input.result);
    const result = await this.logLoveMateRepository.save(logCalculateEntity);
    return result;
  }

  async getLogLoveMate(_input: LogLoveMateCheckInput): Promise<any> {
    const result = await this.logLoveMateRepository.find({
      where: {
        user_id: _input.user_id,
      },
    });

    return result.length;
  }
}
