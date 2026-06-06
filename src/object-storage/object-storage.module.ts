import { Module } from '@nestjs/common';
import { ObjectStorageController } from './object-storage.controller';
import { ObjectStorageService } from './object-storage.service';
import { MomentService } from 'src/utils/MomentService';
import { AwsConfigModule } from 'src/config/aws';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [AwsConfigModule, HttpModule],
  providers: [ObjectStorageService, MomentService],
  exports: [ObjectStorageService],
  controllers: [ObjectStorageController],
})
export class ObjectStorageModule {}
