import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalyticCharacterForShare } from './entity/analytic-character-for-share-entity.model';
import { AnalyticCharacterForShareInput } from './dto/analytic-charactor-for-share.input';

@Injectable()
export class AnalyticCharacterForShareService {
  constructor(
    @InjectRepository(AnalyticCharacterForShare)
    private readonly analyticCharacterForShareRepository: Repository<AnalyticCharacterForShare>,
  ) {}

  async getAnalytic(_input: AnalyticCharacterForShareInput): Promise<any> {
    const result = await this.analyticCharacterForShareRepository.findOne({
      where: {
        day_above_id: _input.day_above_id,
        day_below_id: _input.day_below_id,
      },
    });
    return result;
  }
}
