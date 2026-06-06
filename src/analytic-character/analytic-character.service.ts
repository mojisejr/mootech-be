import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalyticCharacter } from './entity/analytic-character-entity.model';
import { AnalyticCharacterInput } from './dto/analytic-charactor.input';

@Injectable()
export class AnalyticCharacterService {
  constructor(
    @InjectRepository(AnalyticCharacter)
    private readonly analyticCharacterRepository: Repository<AnalyticCharacter>,
  ) {}

  async getAnalytic(_input: AnalyticCharacterInput): Promise<any> {
    const result = await this.analyticCharacterRepository.findOne({
      where: {
        day_above_id: _input.day_above_id,
        day_below_id: _input.day_below_id,
      },
    });
    return result;
  }
}
