import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalyticFeature } from './entity/analytic-feature-entity.model';
import { AnalyticFeatureInput } from './dto/analytic-feature.input';

@Injectable()
export class AnalyticFeatureService {
  constructor(
    @InjectRepository(AnalyticFeature)
    private readonly analyticFeatureRepository: Repository<AnalyticFeature>,
  ) {}

  async getAnalytic(_input: AnalyticFeatureInput): Promise<any> {
    const result = await this.analyticFeatureRepository.findOne({
      where: {
        element: _input.element,
      },
    });
    return result;
  }
}
