import { Module } from '@nestjs/common';
import { ObjectStorageController } from './object-storage.controller';
import { ObjectStorageService } from './object-storage.service';
import { MomentService } from 'src/utils/MomentService';
import { SupabaseConfigModule } from 'src/config/supabase';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [SupabaseConfigModule, HttpModule],
  providers: [ObjectStorageService, MomentService],
  exports: [ObjectStorageService],
  controllers: [ObjectStorageController],
})
export class ObjectStorageModule {}
