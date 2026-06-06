import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PowerFriendly } from './entity/power-friendly-entity.model';
import { PowerFriendlyService } from './power-friendly.service';
@Module({
  imports: [TypeOrmModule.forFeature([PowerFriendly])],
  controllers: [],
  providers: [PowerFriendlyService],
  exports: [PowerFriendlyService],
})
export class PowerFriendlyModule {}
