import { Module } from '@nestjs/common';
import { Calendar100Year } from './entity/calendar-100-year-entity.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calendar100YearService } from './calendar-100-year.service';
import { MomentService } from 'src/utils/MomentService';
@Module({
  imports: [TypeOrmModule.forFeature([Calendar100Year])],
  controllers: [],
  providers: [Calendar100YearService, MomentService],
  exports: [Calendar100YearService],
})
export class Calendar100YearModule {}
