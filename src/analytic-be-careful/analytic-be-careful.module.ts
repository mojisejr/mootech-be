import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticBeCareful } from './entity/analytic-be-careful-entity.model';
import { AnalyticBeCarefulService } from './analytic-be-careful.service';
@Module({
  imports: [TypeOrmModule.forFeature([AnalyticBeCareful])],
  controllers: [],
  providers: [AnalyticBeCarefulService],
  exports: [AnalyticBeCarefulService],
})
export class AnalyticBeCarefulModule {}
