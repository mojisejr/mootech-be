import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticElementalCharacteristicsCalculate } from './entity/analytic-elemental-characteristics-calculate-entity.model';
import { AnalyticElementalCharacteristicsService } from './analytic-elemental-characteristics.service';
import { AnalyticElementalCharacteristicsResult } from './entity/analytic-elemental-characteristics-result-entity.model';
import { AnalyticElementalCharacteristicsElementResult } from './entity/analytic-elemental-characteristics-result-element-entity.model';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticElementalCharacteristicsCalculate,
      AnalyticElementalCharacteristicsResult,
      AnalyticElementalCharacteristicsElementResult,
    ]),
  ],
  controllers: [],
  providers: [AnalyticElementalCharacteristicsService],
  exports: [AnalyticElementalCharacteristicsService],
})
export class AnalyticElementalCharacteristicsModule {}
