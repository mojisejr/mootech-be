import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ElementCycle } from './entity/element-cycle-entity.model';

@Injectable()
export class ElementCycleService {
  constructor(
    @InjectRepository(ElementCycle)
    private readonly elementCycleRepository: Repository<ElementCycle>,
  ) {}

  async getElementCycle(
    element: string,
    power: string,
    gender: string,
  ): Promise<any> {
    const result = await this.elementCycleRepository.findOne({
      where: {
        element: element,
        power: power,
        gender: gender,
      },
    });
    return result;
  }
}
