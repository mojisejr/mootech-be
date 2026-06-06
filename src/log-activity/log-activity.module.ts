import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentService } from 'src/utils/MomentService';
import { LogActivity } from './entity/log-activity-entity.model';
import { LogActivityService } from './log-activity.service';
import { Activity } from './entity/activity-entity.model';
import { LogActivityController } from './log-activity.controller';
@Module({
  imports: [TypeOrmModule.forFeature([LogActivity, Activity])],
  controllers: [LogActivityController],
  providers: [LogActivityService, MomentService],
  exports: [LogActivityService],
})
export class LogActivityModule {}
