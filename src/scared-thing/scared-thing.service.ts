import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScaredThing } from './entity/scared-thing-entity.model';
import { ScaredThingGetInput } from './dto/scared-thing-get.input';

@Injectable()
export class ScaredThingService {
  constructor(
    @InjectRepository(ScaredThing)
    private readonly scaredThingRepository: Repository<ScaredThing>,
  ) {}

  async getScaredThing(_input: ScaredThingGetInput): Promise<any> {
    const result = await this.scaredThingRepository
      .createQueryBuilder('scared_thing')
      .select('scared_thing.name', 'name')
      .addSelect('scared_thing.url', 'url')
      .where('code IN (:...code)', { code: _input.code })
      .getRawMany();
    return result;
  }

  async getScaredThingByCode(code: string): Promise<any> {
    const result = await this.scaredThingRepository
      .createQueryBuilder('scared_thing')
      .select('scared_thing.name', 'name')
      .addSelect('scared_thing.url', 'url')
      .where('code = :code', { code: code })
      .getRawOne();
    return result;
  }
}
