import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticSacredThing } from './entity/analytic-sacred-thing-entity.model';
import { AnalyticSacredThingService } from './analytic-sacred-thing.service';
@Module({
  imports: [TypeOrmModule.forFeature([AnalyticSacredThing])],
  controllers: [],
  providers: [AnalyticSacredThingService],
  exports: [AnalyticSacredThingService],
})
export class AnalyticSacredThingModule {}
