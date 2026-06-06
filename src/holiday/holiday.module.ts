import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Holiday } from './entity/holiday-entity.model';
import { HolidayService } from './holiday.service';
@Module({
  imports: [TypeOrmModule.forFeature([Holiday])],
  controllers: [],
  providers: [HolidayService],
  exports: [HolidayService],
})
export class HolidayModule {}
