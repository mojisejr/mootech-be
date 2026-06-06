import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScaredThing } from './entity/scared-thing-entity.model';
import { ScaredThingService } from './scared-thing.service';
@Module({
  imports: [TypeOrmModule.forFeature([ScaredThing])],
  controllers: [],
  providers: [ScaredThingService],
  exports: [ScaredThingService],
})
export class ScaredThingModule {}
