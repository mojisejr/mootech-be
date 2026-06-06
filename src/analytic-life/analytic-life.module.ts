import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticLife } from './entity/analytic-life-entity.model';
import { AnalyticLifeService } from './analytic-life.service';
@Module({
  imports: [TypeOrmModule.forFeature([AnalyticLife])],
  controllers: [],
  providers: [AnalyticLifeService],
  exports: [AnalyticLifeService],
})
export class AnalyticLifeModule {}
