import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ElementCycle } from './entity/element-cycle-entity.model';
import { ElementCycleService } from './element-cycle.service';
@Module({
  imports: [TypeOrmModule.forFeature([ElementCycle])],
  controllers: [],
  providers: [ElementCycleService],
  exports: [ElementCycleService],
})
export class ElementCycleModule {}
