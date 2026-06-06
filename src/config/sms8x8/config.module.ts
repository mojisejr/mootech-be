import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SMS8x8ConfigService } from './config.service';
import configuration from './configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  providers: [ConfigService, SMS8x8ConfigService],
  exports: [ConfigService, SMS8x8ConfigService],
})
export class SMS8x8ConfigModule {}
