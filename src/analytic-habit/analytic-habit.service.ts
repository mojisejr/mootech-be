import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalyticHabitInput } from './dto/analytic-habit.input';
import { AnalyticHabit } from './entity/analytic-habit-entity.model';

@Injectable()
export class AnalyticHabitService {
  constructor(
    @InjectRepository(AnalyticHabit)
    private readonly analyticHabitRepository: Repository<AnalyticHabit>,
  ) {}

  async getAnalytic(_input: AnalyticHabitInput): Promise<any> {
    const result = await this.analyticHabitRepository.findOne({
      where: {
        day_above_element: _input.day_above_element,
        power: _input.power,
        level: _input.level,
      },
    });
    return result;
    // if (_input.level == 'STRONG') {
    //   const list: any[] = [];
    //   for (let i = 0; i < result.length; i++) {
    //     const r = result[i];
    //     if (result.length > 1) {
    //       if (
    //         result[0].element != _input.day_above_element &&
    //         r.sequence == 2
    //       ) {
    //         list.push(r);
    //       }
    //     }
    //   }
    // } else {
    //   return result;
    // }
  }
}
