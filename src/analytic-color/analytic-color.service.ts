import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalyticColorInput } from './dto/analytic-color.input';
import { AnalyticColor } from './entity/analytic-color-entity.model';

@Injectable()
export class AnalyticColorService {
  constructor(
    @InjectRepository(AnalyticColor)
    private readonly analyticColorRepository: Repository<AnalyticColor>,
  ) {}

  async getAnalytic(_input: AnalyticColorInput): Promise<any> {
    const result = await this.analyticColorRepository.find({
      where: {
        day_above_element: _input.day_above_element,
        level: _input.level,
      },
      order: {
        sequence: 'ASC',
      },
    });

    if (_input.level == 'STRONG') {
      const list: any[] = [];
      for (let i = 0; i < result.length; i++) {
        const r = result[i];
        if (result.length > 1) {
          if (
            result[0].element != _input.day_above_element &&
            r.sequence == 2
          ) {
            list.push(r);
          }
        }
      }
    } else {
      return result;
    }
  }

  async getAnalyticByElement(element: string, level: string): Promise<any> {
    const result = await this.analyticColorRepository.findOne({
      where: {
        element: element,
        level: level,
      },
    });

    return result;
  }
}
