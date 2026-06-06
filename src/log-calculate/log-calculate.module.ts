import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentService } from 'src/utils/MomentService';
import { LogCalculate } from './entity/log-calculate-entity.model';
import { LogCalculateService } from './log-calculate.service';
@Module({
  imports: [TypeOrmModule.forFeature([LogCalculate])],
  controllers: [],
  providers: [LogCalculateService, MomentService],
  exports: [LogCalculateService],
})
export class LogCalculateModule {}
