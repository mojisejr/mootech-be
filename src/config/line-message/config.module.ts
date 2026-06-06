import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration';
import { LineMessageConfigService } from './config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
  ],
  providers: [ConfigService, LineMessageConfigService],
  exports: [ConfigService, LineMessageConfigService],
})
export class LineMessageConfigModule {}
