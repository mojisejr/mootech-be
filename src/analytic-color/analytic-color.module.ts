import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticColor } from './entity/analytic-color-entity.model';
import { AnalyticColorService } from './analytic-color.service';
@Module({
  imports: [TypeOrmModule.forFeature([AnalyticColor])],
  controllers: [],
  providers: [AnalyticColorService],
  exports: [AnalyticColorService],
})
export class AnalyticColorModule {}
