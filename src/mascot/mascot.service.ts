import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mascot } from './entity/mascot-entity.model';
import { MascotGetInput } from './dto/mascot-get.input';
import { MascotGetV60Input } from './dto/mascot-get-v-60.input';
import { MascotV2 } from './entity/mascot-v2-entity.model';

@Injectable()
export class MascotService {
  constructor(
    @InjectRepository(Mascot)
    private readonly mascotRepository: Repository<Mascot>,
    @InjectRepository(MascotV2)
    private readonly mascotV2Repository: Repository<MascotV2>,
  ) {}

  async getMascot(_input: MascotGetInput): Promise<any> {
    const result = await this.mascotRepository.findOne({
      where: {
        day_above_element: _input.day_above_element,
        power: _input.power,
        gender: _input.gender,
      },
    });
    return result;
  }

  async getMascot60Character(_input: MascotGetV60Input): Promise<any> {
    // const key = `mascot_fire_above_1_below_1.png`
    // 1 : YANG
    // 2 : YIN
    const key = `mascot_${_input.element}_above_${
      _input.power == 'YIN' ? 2 : 1
    }_below_${_input.day_below_id}.png`;
    return `https://cdn.phoenix-stark.com/mootech/mascot/v2/${key.toLocaleLowerCase()}`;
  }

  async getMascotV2(_input: MascotGetV60Input): Promise<any> {
    const result = await this.mascotV2Repository.findOne({
      where: {
        day_below_id: _input.day_below_id,
        power: _input.power,
        element: _input.element,
      },
    });
    return result;
  }

  async getMascotV2All(): Promise<any> {
    const result = await this.mascotV2Repository.find({
      order: {
        id: 'ASC',
      },
    });
    return result;
  }
}
