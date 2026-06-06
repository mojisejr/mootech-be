import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalyticBeCareful } from './entity/analytic-be-careful-entity.model';
import { AnalyticBeCarefulInput } from './dto/analytic-be-careful.input';

@Injectable()
export class AnalyticBeCarefulService {
  constructor(
    @InjectRepository(AnalyticBeCareful)
    private readonly analyticBeCarefulRepository: Repository<AnalyticBeCareful>,
  ) {}

  async getAnalytic(_input: AnalyticBeCarefulInput): Promise<any> {
    const result = await this.analyticBeCarefulRepository.findOne({
      where: {
        day_above_element: _input.day_above_element,
        power: _input.power,
      },
    });
    return result;
  }
}
