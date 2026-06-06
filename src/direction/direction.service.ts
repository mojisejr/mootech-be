import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Direction } from './entity/direction-entity.model';

@Injectable()
export class DirectionService {
  constructor(
    @InjectRepository(Direction)
    private readonly directionRepository: Repository<Direction>,
  ) {}

  async getDirection(code: string): Promise<any> {
    const result = await this.directionRepository.findOne({
      where: {
        code: code,
      },
    });
    return result;
  }
}
