import { Injectable } from '@nestjs/common';
import { Raw, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PowerKnowledge } from './entity/power-knowledge-entity.model';
import { PowerKnowledgeDescription } from './entity/power-knowledge-description-entity.model';
import { PowerKnowledgeInput } from './dto/power-knowledge.input';

@Injectable()
export class PowerKnowledgeService {
  constructor(
    @InjectRepository(PowerKnowledge)
    private readonly PowerKnowledgeRepository: Repository<PowerKnowledge>,
    @InjectRepository(PowerKnowledgeDescription)
    private readonly powerKnowledgeDescriptionRepository: Repository<PowerKnowledgeDescription>,
  ) {}

  async getAnalytic(_input: PowerKnowledgeInput): Promise<any> {
    const result = await this.PowerKnowledgeRepository.findOne({
      where: {
        day_above_id: _input.day_above_id,
        day_below_id: _input.day_below_id,
        time_above_id: _input.time_above_id,
        time_below_id: _input.time_below_id,
      },
    });

    if (result) {
      const codes = JSON.parse(result.details);
      const uniqueCodes = [...new Set(codes)];
      const resultDesc = await this.powerKnowledgeDescriptionRepository
        .createQueryBuilder('power_knowledge_description')
        .select('power_knowledge_description.note', 'note')
        .where('code IN (:...code)', { code: uniqueCodes })
        .getRawMany();
      return {
        result: result,
        desc: resultDesc,
      };
    }

    return result;
  }
}
