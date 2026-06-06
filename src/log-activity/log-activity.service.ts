import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MomentService } from 'src/utils/MomentService';
import { Activity } from './entity/activity-entity.model';
import { LogActivityInsertInput } from './dto/log-activity-insert.input';
import { LogActivity } from './entity/log-activity-entity.model';
import { LogActivityGetInput } from './dto/log-activity-get.input';

@Injectable()
export class LogActivityService {
  constructor(
    @InjectRepository(LogActivity)
    private readonly logActivityRepository: Repository<LogActivity>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,

    private momentWrapper: MomentService,
  ) {}

  async insertLogActivity(_input: LogActivityInsertInput): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    const logCalculateEntity = new LogActivity();
    logCalculateEntity.user_id = _input.user_id;
    logCalculateEntity.createAt = createAt;
    logCalculateEntity.activity_id = _input.activity_id;
    logCalculateEntity.point = _input.point;
    const result = await this.logActivityRepository.save(logCalculateEntity);
    return result;
  }

  async getLogsByUserId(userId: string) {
    const result = await this.logActivityRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect(Activity, 'activity', 'log.activity_id = activity.id')
      .where('log.user_id = :userId', { userId })
      .orderBy('log.createAt', 'DESC')
      .select([
        'log.createAt AS create_at',
        'activity.description AS activity_name',
        'log.point AS point',
      ])
      .getRawMany();

    return { data: result };
  }
}
