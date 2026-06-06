import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MomentService } from 'src/utils/MomentService';
import { LogWorkVibe } from './entity/log-work-vibe-entity.model';
import { LogWorkVibeInsertInput } from './dto/log-work-vibe-insert.input';
import { LogWorkVibeCheckInput } from './dto/log-work-vibe-check.input';

@Injectable()
export class LogWorkVibeService {
  constructor(
    @InjectRepository(LogWorkVibe)
    private readonly logWorkVibeRepository: Repository<LogWorkVibe>,

    private momentWrapper: MomentService,
  ) {}

  async insertLogWorkVibe(_input: LogWorkVibeInsertInput): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    const logCalculateEntity = new LogWorkVibe();
    logCalculateEntity.user_id = _input.user_id;
    logCalculateEntity.createAt = createAt;
    logCalculateEntity.type = _input.type;
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
    const result = await this.logWorkVibeRepository.save(logCalculateEntity);
    return result;
  }

  async getLogWorkVibes(_input: LogWorkVibeCheckInput): Promise<any> {
    const result = await this.logWorkVibeRepository.find({
      where: {
        user_id: _input.user_id,
      },
    });

    return result.length;
  }
}
