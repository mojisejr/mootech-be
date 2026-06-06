import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalyticLoveInput } from './dto/analytic-love.input';
import { AnalyticLove } from './entity/analytic-love-entity.model';

@Injectable()
export class AnalyticLoveService {
  constructor(
    @InjectRepository(AnalyticLove)
    private readonly analyticLoveRepository: Repository<AnalyticLove>,
  ) {}

  async getAnalytic(_input: AnalyticLoveInput): Promise<any> {
    const result = await this.analyticLoveRepository.findOne({
      where: {
        day_above_id: _input.day_above_id,
        day_below_id: _input.day_below_id,
      },
    });

    return result;
  }
}
