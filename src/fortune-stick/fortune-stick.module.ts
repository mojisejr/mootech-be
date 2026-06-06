import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FortuneStick } from './entity/fortune-stick-entity.model';
import { FortuneStickService } from './fortune-stick.service';
import { MascotModule } from 'src/mascot/mascot.module';
import { FortuneStickController } from './fortune-stick.controller';
import { MomentService } from 'src/utils/MomentService';
@Module({
  imports: [TypeOrmModule.forFeature([FortuneStick]), MascotModule],
  controllers: [FortuneStickController],
  providers: [FortuneStickService, MomentService],
  exports: [FortuneStickService],
})
export class FortuneStickModule {}
