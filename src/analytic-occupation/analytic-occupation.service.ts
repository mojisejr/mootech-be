import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalyticOccupationInput } from './dto/analytic-occupation.input';
import { AnalyticOccupation } from './entity/analytic-occupation-entity.model';

@Injectable()
export class AnalyticOccupationService {
  constructor(
    @InjectRepository(AnalyticOccupation)
    private readonly analyticOccupationRepository: Repository<AnalyticOccupation>,
  ) {}

  async getAnalytic(_input: AnalyticOccupationInput): Promise<any> {
    const result = await this.analyticOccupationRepository.find({
      where: {
        day_above_element: _input.day_above_element,
      },
      order: {
        sequence: 'ASC',
      },
    });

    return result;
  }

  async calculate(_input: any): Promise<any> {
    // WOOD : WOOD / WATER
    // FIRE : FIRE / WOOD
    // EARTH : EARTH / FIRE
    // METAL : METAL / EARTH
    // WATER : WATER / METAL

    /*

        ยาม	  วัน    เดือน	  ปี
        1     0     1       1
        1     1.5   1.5     1


        6-8       : STRONG
        3.5 - 5.5 : BALANCE -> 
        0   - 3   : WEAK 




    */

    return 0;
  }
}
