import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mascot } from './entity/mascot-entity.model';
import { MascotService } from './mascot.service';
import { MascotV2 } from './entity/mascot-v2-entity.model';
@Module({
  imports: [TypeOrmModule.forFeature([Mascot, MascotV2])],
  controllers: [],
  providers: [MascotService],
  exports: [MascotService],
})
export class MascotModule {}
