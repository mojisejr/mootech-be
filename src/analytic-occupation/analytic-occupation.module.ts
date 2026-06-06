import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticOccupation } from './entity/analytic-occupation-entity.model';
import { AnalyticOccupationService } from './analytic-occupation.service';
@Module({
  imports: [TypeOrmModule.forFeature([AnalyticOccupation])],
  controllers: [],
  providers: [AnalyticOccupationService],
  exports: [AnalyticOccupationService],
})
export class AnalyticOccupationModule {}
