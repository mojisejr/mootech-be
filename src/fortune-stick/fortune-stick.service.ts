import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FortuneStick } from './entity/fortune-stick-entity.model';
import { FortuneStickGetInput } from './dto/fortune-stick-get.input';
import { MascotService } from 'src/mascot/mascot.service';
import { MomentService } from 'src/utils/MomentService';

@Injectable()
export class FortuneStickService {
  constructor(
    @InjectRepository(FortuneStick)
    private readonly fortuneStickRepository: Repository<FortuneStick>,
    private momentWrapper: MomentService,
    private mascotService: MascotService,
  ) {}

  async getFortuneStick(_input: FortuneStickGetInput): Promise<any> {
    const mascots = await this.mascotService.getMascotV2All();
    const randomMascot = mascots[Math.floor(Math.random() * mascots.length)];

    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');
    const entity = new FortuneStick();
    entity.create_at = createAt;
    entity.mascot_id = randomMascot.id;
    entity.user_id = _input.user_id;
    await this.fortuneStickRepository.save(entity);
    return randomMascot;
  }
}
