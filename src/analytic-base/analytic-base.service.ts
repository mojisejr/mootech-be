import { Injectable } from '@nestjs/common';
import { AnalyticBase } from './entity/analytic-base-entity.model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalyticBaseInput } from './dto/analytic-base.input';

@Injectable()
export class AnalyticBaseService {
  constructor(
    @InjectRepository(AnalyticBase)
    private readonly analyticBaseRepository: Repository<AnalyticBase>,
  ) {}

  async getAnalyticBaseService(_input: AnalyticBaseInput): Promise<any> {
    const result = await this.analyticBaseRepository.findOne({
      where: {
        element: _input.day_above_element,
      },
    });
    if (result) {
      return {
        element: result.element,
        power: result.power,
        note: result.note,
      };
    }
    return null;
  }
}
