import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentService } from 'src/utils/MomentService';
import { LogSaveImage } from './entity/log-save-image-entity.model';
import { LogSaveImageService } from './log-save-image.service';
import { LogSaveImageController } from './log-save-image.controller';
@Module({
  imports: [TypeOrmModule.forFeature([LogSaveImage])],
  controllers: [LogSaveImageController],
  providers: [LogSaveImageService, MomentService],
  exports: [LogSaveImageService],
})
export class LogSaveImageModule {}
