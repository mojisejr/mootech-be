import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentService } from 'src/utils/MomentService';
import { LogSurvey } from './entity/log-survey-entity.model';
import { LogSurveyService } from './log-survey.service';
import { LogSurveyController } from './log-survey.controller';
@Module({
  imports: [TypeOrmModule.forFeature([LogSurvey])],
  controllers: [LogSurveyController],
  providers: [LogSurveyService, MomentService],
  exports: [LogSurveyService],
})
export class LogSurveyModule {}
