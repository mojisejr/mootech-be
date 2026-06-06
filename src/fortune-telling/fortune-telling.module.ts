import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FortuneTellingService } from './fortune-telling.service';
import { MomentService } from 'src/utils/MomentService';
import { FortuneTellingController } from './fortune-telling.controller';
import { MemberPaymentModule } from 'src/member-payment/member-payment.module';
import { FortuneTelling } from './entity/fortune-telling-entity.model';
import { FortuneTellingLog } from './entity/fortune-telling-log-entity.model';
@Module({
  imports: [
    TypeOrmModule.forFeature([FortuneTelling, FortuneTellingLog]),
    MemberPaymentModule,
  ],
  controllers: [FortuneTellingController],
  providers: [FortuneTellingService, MomentService],
  exports: [FortuneTellingService],
})
export class FortuneTellingModule {}
