import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentService } from 'src/utils/MomentService';
import { LogLoveMateController } from './log-love-mate.controller';
import { LogLoveMate } from './entity/log-love-mate-entity.model';
import { LogWoLoveMateService } from './log-love-mate.service';
@Module({
  imports: [TypeOrmModule.forFeature([LogLoveMate])],
  controllers: [LogLoveMateController],
  providers: [LogWoLoveMateService, MomentService],
  exports: [LogWoLoveMateService],
})
export class LogLoveMateModule {}
