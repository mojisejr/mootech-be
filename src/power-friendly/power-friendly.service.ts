import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PowerFriendly } from './entity/power-friendly-entity.model';
import { PowerFriendlyInput } from './dto/power-friendly.input';

@Injectable()
export class PowerFriendlyService {
  constructor(
    @InjectRepository(PowerFriendly)
    private readonly powerFriendlyRepository: Repository<PowerFriendly>,
  ) {}

  async getAnalytic(_input: PowerFriendlyInput): Promise<any> {
    const result = await this.powerFriendlyRepository.findOne({
      where: {
        day_above_id: _input.day_above_id,
        day_below_id: _input.day_below_id,
      },
    });

    return result;
  }
}
