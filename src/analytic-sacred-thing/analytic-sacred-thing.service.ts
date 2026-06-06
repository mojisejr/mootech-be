import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalyticSacredThingInput } from './dto/analytic-sacred-thing.input';
import { AnalyticSacredThing } from './entity/analytic-sacred-thing-entity.model';

@Injectable()
export class AnalyticSacredThingService {
  constructor(
    @InjectRepository(AnalyticSacredThing)
    private readonly analyticSacredThingRepository: Repository<AnalyticSacredThing>,
  ) {}

  async getAnalytic(_input: AnalyticSacredThingInput): Promise<any> {
    const result = await this.analyticSacredThingRepository.find({
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
}
