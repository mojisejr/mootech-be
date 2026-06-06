import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PowerEducation } from './entity/power-education-entity.model';
import { PowerEducationDescription } from './entity/power-education-description-entity.model';
import { PowerEducationInput } from './dto/power-education.input';

@Injectable()
export class PowerEducationService {
  constructor(
    @InjectRepository(PowerEducation)
    private readonly powerEducationRepository: Repository<PowerEducation>,
    @InjectRepository(PowerEducationDescription)
    private readonly powerEducationDescriptionRepository: Repository<PowerEducationDescription>,
  ) {}

  async getAnalytic(_input: PowerEducationInput): Promise<any> {
    const result = await this.powerEducationRepository.findOne({
      where: {
        day_above_id: _input.day_above_id,
        day_below_id: _input.day_below_id,
        month_above_id: _input.month_above_id,
        month_below_id: _input.month_below_id,
      },
    });

    if (result) {
      const codes = JSON.parse(result.details);
      const uniqueCodes = [...new Set(codes)];
      const resultDesc = await this.powerEducationDescriptionRepository
        .createQueryBuilder('power_education_description')
        .select('power_education_description.note', 'note')
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
