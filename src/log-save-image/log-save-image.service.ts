import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MomentService } from 'src/utils/MomentService';
import { LogSaveImageInsertInput } from './dto/log-save-image-insert.input';
import { LogSaveImage } from './entity/log-save-image-entity.model';

@Injectable()
export class LogSaveImageService {
  constructor(
    @InjectRepository(LogSaveImage)
    private readonly logSaveImageRepository: Repository<LogSaveImage>,
    private momentWrapper: MomentService,
  ) {}

  async insertLogActivity(_input: LogSaveImageInsertInput): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    const logCalculateEntity = new LogSaveImage();
    logCalculateEntity.user_id = _input.user_id;
    logCalculateEntity.createAt = createAt;
    const result = await this.logSaveImageRepository.save(logCalculateEntity);
    return result;
  }
}
