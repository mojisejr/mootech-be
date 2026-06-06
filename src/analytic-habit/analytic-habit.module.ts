import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticHabit } from './entity/analytic-habit-entity.model';
import { AnalyticHabitService } from './analytic-habit.service';
@Module({
  imports: [TypeOrmModule.forFeature([AnalyticHabit])],
  controllers: [],
  providers: [AnalyticHabitService],
  exports: [AnalyticHabitService],
})
export class AnalyticHabitModule {}
