import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticFeature } from './entity/analytic-feature-entity.model';
import { AnalyticFeatureService } from './analytic-feature.service';
@Module({
  imports: [TypeOrmModule.forFeature([AnalyticFeature])],
  controllers: [],
  providers: [AnalyticFeatureService],
  exports: [AnalyticFeatureService],
})
export class AnalyticFeatureModule {}
