import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CompatibilityWork } from './entity/compatibility-work-entity.model';
import { CompatibilityWorkRating } from './entity/compatibility-work-rating-entity.model';
import { CompatibilityWorkDescription } from './entity/compatibility-work-description-entity.model';
import { CompatibilityWorkInput } from './dto/compatibility-work.input';
import { findRatingBand } from '../utils/rating-band';

@Injectable()
export class CompatibilityWorkService {
  constructor(
    @InjectRepository(CompatibilityWork)
    private readonly compatibilityWorkRepository: Repository<CompatibilityWork>,
    @InjectRepository(CompatibilityWorkRating)
    private readonly compatibilityWorkRatingRepository: Repository<CompatibilityWorkRating>,
    @InjectRepository(CompatibilityWorkDescription)
    private readonly compatibilityWorkDescriptionRepository: Repository<CompatibilityWorkDescription>,
  ) {}

  async getAnalytic(_input: CompatibilityWorkInput): Promise<any> {
    const result = await this.compatibilityWorkRepository.findOne({
      where: {
        day_above_id: _input.person_1_above_id,
        day_below_id: _input.person_1_below_id,
        year_above_id: _input.person_2_above_id,
        year_below_id: _input.person_2_below_id,
      },
    });

    if (result) {
      let score = result.score * 100;
      score = Math.round(score * 100) / 100;
      // Match the score band in JS (dialect-proof). The rating table is tiny; this replaces a
      // fragile TypeORM Raw() BETWEEN that broke on Postgres. #mootech-matching-calculate-robustness
      const ratings = await this.compatibilityWorkRatingRepository.find();
      const resultRating = findRatingBand(ratings, score);

      const codes = JSON.parse(result.details);
      const uniqueCodes = [...new Set(codes)];
      const query = await this.compatibilityWorkDescriptionRepository
        .createQueryBuilder('compatibility_work_description')
        .where('code IN (:...code)', { code: uniqueCodes });

      if (_input.type == 'EMPLOYEE') {
        query.select('compatibility_work_description.employee', 'note');
      } else if (_input.type == 'BOSS') {
        query.select('compatibility_work_description.boss', 'note');
      } else if (_input.type == 'FRIEND') {
        query.select('compatibility_work_description.friend', 'note');
      }

      const resultDesc = await query.getRawMany();

      return {
        result: result,
        score: score,
        rating: resultRating,
        desc: resultDesc,
      };
    }

    return result;
  }
}
