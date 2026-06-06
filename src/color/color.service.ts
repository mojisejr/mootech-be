import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Color } from './entity/color-entity.model';
import { ColorGetInput } from './dto/color-get.input';

@Injectable()
export class ColorService {
  constructor(
    @InjectRepository(Color)
    private readonly colorRepository: Repository<Color>,
  ) {}

  async getColor(_input: ColorGetInput): Promise<any> {
    const result = await this.colorRepository
      .createQueryBuilder('color')
      .select('color.name', 'name')
      .addSelect('color.hex', 'hex')
      .where('code IN (:...code)', { code: _input.code })
      .getRawMany();
    return result;
  }
}
