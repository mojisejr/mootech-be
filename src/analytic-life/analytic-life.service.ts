import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalyticLife } from './entity/analytic-life-entity.model';
import { AnalyticLifeInput } from './dto/analytic-life.input';

@Injectable()
export class AnalyticLifeService {
  constructor(
    @InjectRepository(AnalyticLife)
    private readonly analyticLifeRepository: Repository<AnalyticLife>,
  ) {}

  async getAnalytic(_input: AnalyticLifeInput): Promise<any> {
    const result = await this.analyticLifeRepository.findOne({
      where: {
        day_above_id: _input.day_above_id,
        day_above_below_id: _input.month_id,
        is_above: _input.is_above,
      },
    });
    return result;
  }
}
