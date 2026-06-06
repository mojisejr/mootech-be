import { Injectable } from '@nestjs/common';
import { Raw, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PredictionWorkDescription } from './entity/prediction-description-entity.model';
import { PredictionWorkInput } from './dto/prediction-work.input';
import { PredictionWork } from './entity/prediction-work-entity.model';

@Injectable()
export class PredictionWorkService {
  constructor(
    @InjectRepository(PredictionWork)
    private readonly predictionWorkRepository: Repository<PredictionWork>,
    @InjectRepository(PredictionWorkDescription)
    private readonly predictionWorkDescriptionRepository: Repository<PredictionWorkDescription>,
  ) {}

  async getAnalytic(_input: PredictionWorkInput): Promise<any> {
    const result = await this.predictionWorkRepository.findOne({
      where: {
        day_above_id: _input.day_above_id,
        day_below_id: _input.day_below_id,
        month_above_id: _input.month_above_id,
        month_below_id: _input.month_below_id,
      },
    });

    if (result) {
      let score = result.score * 100;
      score = Math.round(score * 100) / 100;

      const codes = JSON.parse(result.details);
      const uniqueCodes = [...new Set(codes)];
      const resultDesc = await this.predictionWorkDescriptionRepository
        .createQueryBuilder('prediction_love_description')
        .select('prediction_love_description.note', 'note')
        .where('code IN (:...code)', { code: uniqueCodes })
        .getRawMany();
      return {
        result: result,
        score: score,
        desc: resultDesc,
      };
    }

    return result;
  }
}
