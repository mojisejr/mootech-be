import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticLove } from './entity/analytic-love-entity.model';
import { AnalyticLoveService } from './analytic-love.service';
@Module({
  imports: [TypeOrmModule.forFeature([AnalyticLove])],
  controllers: [],
  providers: [AnalyticLoveService],
  exports: [AnalyticLoveService],
})
export class AnalyticLoveModule {}
