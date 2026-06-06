import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PowerFinanceFortune } from './entity/power-finance-fortune-entity.model';
import { PowerFinanceDescription } from './entity/power-finance-description-entity.model';
import { PowerFinanceInput } from './dto/power-finance.input';
import { PowerFinance } from './entity/power-finance-entity.model';
import { PowerFinanceExtra } from './entity/power-finance-extra-entity.model';

@Injectable()
export class PowerFinanceService {
  constructor(
    @InjectRepository(PowerFinance)
    private readonly powerFinanceRepository: Repository<PowerFinance>,
    @InjectRepository(PowerFinanceDescription)
    private readonly powerFinanceDescriptionRepository: Repository<PowerFinanceDescription>,
    @InjectRepository(PowerFinanceFortune)
    private readonly powerFinanceFortuneRepository: Repository<PowerFinanceFortune>,
    @InjectRepository(PowerFinanceExtra)
    private readonly powerFinanceExtraRepository: Repository<PowerFinanceExtra>,
  ) {}

  async getAnalytic(_input: PowerFinanceInput): Promise<any> {
    let result = 0;

    const fortuneRealMatching: any[] = [];

    // REAL FORTUNE
    const listRealFortune = await this.powerFinanceFortuneRepository.find({
      where: {
        is_real: true,
        day_above_id: _input.day_above_id,
      },
    });

    // FIND : YEAR
    if (_input.year_above_id) {
      const isExits = await this.checkExits(
        listRealFortune,
        _input.year_above_id,
        true,
      );
      if (isExits) {
        fortuneRealMatching.push({
          type: 'YEAR',
          is_real: true,
          above_id: _input.year_above_id,
          below_id: _input.year_below_id,
        });
      } else {
        if (_input.year_below_id) {
          const isExits = await this.checkExits(
            listRealFortune,
            _input.year_below_id,
            false,
          );
          if (isExits) {
            fortuneRealMatching.push({
              type: 'YEAR',
              is_real: true,
              above_id: _input.year_above_id,
              below_id: _input.year_below_id,
            });
          }
        }
      }
    }

    // FIND : MONTH
    if (_input.month_above_id) {
      const isExits = await this.checkExits(
        listRealFortune,
        _input.month_above_id,
        true,
      );
      if (isExits) {
        fortuneRealMatching.push({
          type: 'MONTH',
          is_real: true,
          above_id: _input.month_above_id,
          below_id: _input.month_below_id,
        });
      } else {
        if (_input.month_below_id) {
          const isExits = await this.checkExits(
            listRealFortune,
            _input.month_below_id,
            false,
          );
          if (isExits) {
            fortuneRealMatching.push({
              type: 'MONTH',
              is_real: true,
              above_id: _input.month_above_id,
              below_id: _input.month_below_id,
            });
          }
        }
      }
    }
    // FIND : TIME
    if (_input.time_above_id) {
      const isExits = await this.checkExits(
        listRealFortune,
        _input.time_above_id,
        true,
      );
      if (isExits) {
        fortuneRealMatching.push({
          type: 'TIME',
          is_real: true,
          above_id: _input.time_above_id,
          below_id: _input.time_below_id,
        });
      } else {
        if (_input.time_below_id) {
          const isExits = await this.checkExits(
            listRealFortune,
            _input.time_below_id,
            false,
          );
          if (isExits) {
            fortuneRealMatching.push({
              type: 'TIME',
              is_real: true,
              above_id: _input.time_above_id,
              below_id: _input.time_below_id,
            });
          }
        }
      }
    }

    if (fortuneRealMatching.length <= 0) {
      // HIDDEN FORTUNE
      const listHiddenFortune = await this.powerFinanceFortuneRepository.find({
        where: {
          is_real: false,
          day_above_id: _input.day_above_id,
        },
      });

      // FIND : YEAR
      if (_input.year_above_id) {
        const isExits = await this.checkExits(
          listHiddenFortune,
          _input.year_above_id,
          true,
        );
        if (isExits) {
          fortuneRealMatching.push({
            type: 'YEAR',
            is_real: false,
            above_id: _input.year_above_id,
            below_id: _input.year_below_id,
          });
        } else {
          if (_input.year_below_id) {
            const isExits = await this.checkExits(
              listHiddenFortune,
              _input.year_below_id,
              false,
            );
            if (isExits) {
              fortuneRealMatching.push({
                type: 'YEAR',
                is_real: false,
                above_id: _input.year_above_id,
                below_id: _input.year_below_id,
              });
            }
          }
        }
      }

      // FIND : MONTH
      if (_input.month_above_id) {
        const isExits = await this.checkExits(
          listHiddenFortune,
          _input.month_above_id,
          true,
        );
        if (isExits) {
          fortuneRealMatching.push({
            type: 'MONTH',
            is_real: false,
            above_id: _input.month_above_id,
            below_id: _input.month_below_id,
          });
        } else {
          if (_input.month_below_id) {
            const isExits = await this.checkExits(
              listHiddenFortune,
              _input.month_below_id,
              false,
            );
            if (isExits) {
              fortuneRealMatching.push({
                type: 'MONTH',
                is_real: false,
                above_id: _input.month_above_id,
                below_id: _input.month_below_id,
              });
            }
          }
        }
      }
      // // FIND : TIME
      if (_input.time_above_id) {
        const isExits = await this.checkExits(
          listHiddenFortune,
          _input.time_above_id,
          true,
        );
        if (isExits) {
          fortuneRealMatching.push({
            type: 'TIME',
            is_real: false,
            above_id: _input.time_above_id,
            below_id: _input.time_below_id,
          });
        } else {
          if (_input.time_below_id) {
            const isExits = await this.checkExits(
              listHiddenFortune,
              _input.time_below_id,
              false,
            );
            if (isExits) {
              fortuneRealMatching.push({
                type: 'TIME',
                is_real: false,
                above_id: _input.time_above_id,
                below_id: _input.time_below_id,
              });
            }
          }
        }
      }
    }

    let totalScore = 0;
    let total = 0;
    // DAY MATCHING
    for (let m = 0; m < fortuneRealMatching.length; m++) {
      const matching = fortuneRealMatching[m];
      const resultFortune = await this.powerFinanceRepository.findOne({
        where: {
          above_id: _input.day_above_id,
          below_id: _input.day_below_id,
          fortune_above_id: matching.above_id,
          fortune_below_id: matching.below_id,
        },
      });
      if (resultFortune) {
        totalScore += resultFortune.score;
        total++;
      }
    }

    // MONTH MATCHING
    for (let m = 0; m < fortuneRealMatching.length; m++) {
      const matching = fortuneRealMatching[m];
      if (matching.type != 'MONTH') {
        const resultFortune = await this.powerFinanceRepository.findOne({
          where: {
            above_id: _input.month_above_id,
            below_id: _input.month_below_id,
            fortune_above_id: matching.above_id,
            fortune_below_id: matching.below_id,
          },
        });
        if (resultFortune) {
          totalScore += resultFortune.score;
          total++;
        }
      }
    }

    // ธาตุแท้หลักวัน พิเศษ
    if (_input.day_above_id && _input.day_below_id) {
      const extraResult = await this.powerFinanceExtraRepository.findOne({
        where: {
          day_above_id: _input.day_above_id,
          day_below_id: _input.day_below_id,
        },
      });
      if (extraResult) {
        totalScore += extraResult.score;
        total++;
      }
    }

    if (total > 0) {
      result = totalScore / total;
    }

    return {
      score: result,
    };
  }

  async checkExits(
    powers: any[],
    symbol_id: number,
    is_above: boolean,
  ): Promise<any> {
    const exists = powers.some(
      (item) =>
        item.chinese_symbol_id == symbol_id && item.is_above == is_above,
    );

    return exists;
  }
}
