import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AnalyticElementalCharacteristicsResult } from './entity/analytic-elemental-characteristics-result-entity.model';
import { AnalyticElementalCharacteristicsCalculate } from './entity/analytic-elemental-characteristics-calculate-entity.model';
import { AnalyticElementalCharacteristicsInput } from './dto/analytic-elemental-characteristics.input';
import { AnalyticElementalCharacteristicsElementResult } from './entity/analytic-elemental-characteristics-result-element-entity.model';
import { AnalyticElementalCharacteristicsGetElementsInput } from './dto/analytic-elemental-characteristics.input-get-elements';
import { findRatingBand } from '../utils/rating-band';

@Injectable()
export class AnalyticElementalCharacteristicsService {
  constructor(
    @InjectRepository(AnalyticElementalCharacteristicsResult)
    private readonly analyticElementalCharacteristicsResultRepository: Repository<AnalyticElementalCharacteristicsResult>,
    @InjectRepository(AnalyticElementalCharacteristicsElementResult)
    private readonly analyticElementalCharacteristicsElementResultRepository: Repository<AnalyticElementalCharacteristicsElementResult>,
    @InjectRepository(AnalyticElementalCharacteristicsCalculate)
    private readonly analyticElementalCharacteristicsCalculateRepository: Repository<AnalyticElementalCharacteristicsCalculate>,
  ) {}

  async calculateAnalyticElementalCharacteristics(
    _input: AnalyticElementalCharacteristicsInput,
  ): Promise<any> {
    const result =
      await this.analyticElementalCharacteristicsCalculateRepository.find({
        where: {
          day_above_element: _input.day_above_element,
        },
      });
    //
    const yearAboveDetail = 'YEAR_ABOVE';
    const resultYearAboveDetail = result.find(
      (item) => item.detail === yearAboveDetail,
    );
    const yearBelowDetail = 'YEAR_BELOW';
    const resultYearBelowDetail = result.find(
      (item) => item.detail === yearBelowDetail,
    );
    const monthAboveDetail = 'MONTH_ABOVE';
    const resultMonthAboveDetail = result.find(
      (item) => item.detail === monthAboveDetail,
    );
    const monthBelowDetail = 'MONTH_BELOW';
    const resultMonthBelowDetail = result.find(
      (item) => item.detail === monthBelowDetail,
    );
    const dayAboveDetail = 'DAY_ABOVE';
    const resultDayAboveDetail = result.find(
      (item) => item.detail === dayAboveDetail,
    );
    const dayBelowDetail = 'DAY_BELOW';
    const resultDeyBelowDetail = result.find(
      (item) => item.detail === dayBelowDetail,
    );

    let score = 0;
    if (resultYearAboveDetail) {
      const exists = resultYearAboveDetail.gain_elements.includes(
        _input.year_above_element,
      );
      if (exists) {
        score += resultYearAboveDetail.weight;
      }
    }
    if (resultYearBelowDetail) {
      const exists = resultYearBelowDetail.gain_elements.includes(
        _input.year_below_element,
      );
      if (exists) {
        score += resultYearBelowDetail.weight;
      }
    }

    if (resultMonthAboveDetail) {
      const exists = resultMonthAboveDetail.gain_elements.includes(
        _input.month_above_element,
      );

      if (exists) {
        score += resultMonthAboveDetail.weight;
      }
    }
    if (resultMonthBelowDetail) {
      const exists = resultMonthBelowDetail.gain_elements.includes(
        _input.month_below_element,
      );

      if (exists) {
        score += resultMonthBelowDetail.weight;
      }
    }

    if (resultDayAboveDetail) {
      const exists = resultDayAboveDetail.gain_elements.includes(
        _input.day_above_element,
      );

      if (exists) {
        score += resultDayAboveDetail.weight;
      }
    }
    if (resultDeyBelowDetail) {
      const exists = resultDeyBelowDetail.gain_elements.includes(
        _input.day_below_element,
      );

      if (exists) {
        score += resultDeyBelowDetail.weight;
      }
    }

    // Match the score band in JS (dialect-proof) instead of a TypeORM Raw() BETWEEN that
    // breaks on Postgres (same alias bug class as compatibility-*). Verbatim bounds (round:false)
    // to preserve the original `score BETWEEN start_score AND end_score`. #mootech-matching-calculate-robustness
    const rows =
      await this.analyticElementalCharacteristicsResultRepository.find({
        where: { day_above_element: _input.day_above_element },
      });
    const resultAnalytic = findRatingBand(rows, score, { round: false });

    return resultAnalytic;
  }

  async getAnalytic(
    _input: AnalyticElementalCharacteristicsGetElementsInput,
  ): Promise<any> {
    const result =
      await this.analyticElementalCharacteristicsElementResultRepository.find({
        where: {
          day_above_element: _input.day_above_element,
          level: _input.level,
        },
        order: {
          sequence: 'ASC',
        },
      });
    // return result;
    if (_input.level == 'STRONG') {
      const list: any[] = [];
      for (let i = 0; i < result.length; i++) {
        const r = result[i];
        if (result.length > 1) {
          if (
            result[0].element != _input.day_above_element &&
            r.sequence == 2
          ) {
            list.push(r);
          }
        }
      }
    } else {
      return result;
    }
  }
}
