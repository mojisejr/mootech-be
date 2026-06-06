import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogSurveyInsertInput } from './dto/log-survey-insert.input';
import { MomentService } from 'src/utils/MomentService';
import { LogSurvey } from './entity/log-survey-entity.model';
import { LogSurveyGetInput } from './dto/log-survey-get.input';

@Injectable()
export class LogSurveyService {
  constructor(
    @InjectRepository(LogSurvey)
    private readonly logSurveyRepository: Repository<LogSurvey>,

    private momentWrapper: MomentService,
  ) {}

  async insertLogSurvey(_input: LogSurveyInsertInput): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    const logCalculateEntity = new LogSurvey();
    logCalculateEntity.user_id = _input.user_id;
    logCalculateEntity.createAt = createAt;
    logCalculateEntity.code = this.generateRandomString();
    logCalculateEntity.result = JSON.stringify(_input.result);
    const result = await this.logSurveyRepository.save(logCalculateEntity);
    return result;
  }

  async getLogSurvey(code: string): Promise<any> {
    const result = await this.logSurveyRepository.findOne({
      where: {
        code: code,
      },
    });

    if (result) {
      return result;
    }

    return null;
  }

  async getLogSurveyByUser(input: LogSurveyGetInput): Promise<any> {
    const result = await this.logSurveyRepository.find({
      where: {
        user_id: input.user_id,
      },
      order: {
        createAt: 'DESC',
      },
    });

    const list: any[] = [];
    for (let i = 0; i < result.length; i++) {
      const json = JSON.parse(result[i].result);
      list.push({
        url: json.url,
        code: result[i].code,
        emoji: json.emoji,
        title: json.title,
        description: json.description,
        create_at: result[i].createAt,
      });
    }

    return list;
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
