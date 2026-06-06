import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentService } from 'src/utils/MomentService';
import { LogWorkVibe } from './entity/log-work-vibe-entity.model';
import { LogWorkVibeService } from './log-work-vibe.service';
import { LogWorkVibeController } from './log-work-vibe.controller';
@Module({
  imports: [TypeOrmModule.forFeature([LogWorkVibe])],
  controllers: [LogWorkVibeController],
  providers: [LogWorkVibeService, MomentService],
  exports: [LogWorkVibeService],
})
export class LogWorkVibeModule {}
