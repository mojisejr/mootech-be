import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticBase } from './entity/analytic-base-entity.model';
import { AnalyticBaseService } from './analytic-base.service';
@Module({
  imports: [TypeOrmModule.forFeature([AnalyticBase])],
  controllers: [],
  providers: [AnalyticBaseService],
  exports: [AnalyticBaseService],
})
export class AnalyticBaseModule {}
