import { Module } from '@nestjs/common';
import { SendGridController } from './send-grid.controller';
import { ConfigModule } from '@nestjs/config';
import { SendGridService } from './send-grid.service';
import { MomentService } from 'src/utils/MomentService';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [SendGridService, MomentService],
  exports: [SendGridService],
  controllers: [SendGridController],
})
export class SendGridModule {}
