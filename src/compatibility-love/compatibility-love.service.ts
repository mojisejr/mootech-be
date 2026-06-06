import { Injectable } from '@nestjs/common';
import { Raw, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CompatibilityLove } from './entity/compatibility-love-entity.model';
import { CompatibilityLoveRating } from './entity/compatibility-love-rating-entity.model';
import { CompatibilityLoveDescription } from './entity/compatibility-love-description-entity.model';
import { CompatibilityLoveInput } from './dto/compatibility-love.input';

@Injectable()
export class CompatibilityLoveService {
  constructor(
    @InjectRepository(CompatibilityLove)
    private readonly compatibilityLoveRepository: Repository<CompatibilityLove>,
    @InjectRepository(CompatibilityLoveRating)
    private readonly compatibilityLoveRatingRepository: Repository<CompatibilityLoveRating>,
    @InjectRepository(CompatibilityLoveDescription)
    private readonly compatibilityLoveDescriptionRepository: Repository<CompatibilityLoveDescription>,
  ) {}

  async getAnalytic(_input: CompatibilityLoveInput): Promise<any> {
    const result = await this.compatibilityLoveRepository.findOne({
      where: {
        day_above_id: _input.day_above_id,
        day_below_id: _input.day_below_id,
        year_above_id: _input.year_above_id,
        year_below_id: _input.year_below_id,
      },
    });

    if (result) {
      let score = result.score * 100;

      score = Math.round(score * 100) / 100;
      const resultRating = await this.compatibilityLoveRatingRepository.findOne(
        {
          where: {
            start_score: Raw(
              (alias) =>
                `${score} BETWEEN ROUND(${alias}, 2) AND ROUND(end_score, 2)`,
            ),
          },
        },
      );

      const codes = JSON.parse(result.details);
      const uniqueCodes = [...new Set(codes)];
      const resultDesc = await this.compatibilityLoveDescriptionRepository
        .createQueryBuilder('compatibility_love_description')
        .select('compatibility_love_description.note', 'note')
        .where('code IN (:...code)', { code: uniqueCodes })
        .getRawMany();
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
