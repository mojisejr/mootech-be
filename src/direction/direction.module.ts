import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Direction } from './entity/direction-entity.model';
import { DirectionService } from './direction.service';
@Module({
  imports: [TypeOrmModule.forFeature([Direction])],
  controllers: [],
  providers: [DirectionService],
  exports: [DirectionService],
})
export class DirectionModule {}
