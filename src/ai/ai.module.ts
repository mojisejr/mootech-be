import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { MomentService } from 'src/utils/MomentService';
import { MemberPaymentModule } from 'src/member-payment/member-payment.module';
import { AIController } from './ai.controller';
import { UserModule } from 'src/user/user.module';
import { LogCalculateModule } from 'src/log-calculate/log-calculate.module';
import { LogAI } from './entity/log-ai-entity.model';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberPayAsUseModule } from 'src/member-pay-as-use/member-pay-as-use.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([LogAI]),
    HttpModule,
    MemberPaymentModule,
    UserModule,
    LogCalculateModule,
    MemberPayAsUseModule,
  ],
  controllers: [AIController],
  providers: [AiService, MomentService],
  exports: [AiService],
})
export class AIModule {}
