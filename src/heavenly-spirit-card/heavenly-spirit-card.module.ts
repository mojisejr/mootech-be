import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeavenlySpiritCard } from './entity/heavenly-spirit-card-entity.model';
import { HeavenlySpiritCardService } from './heavenly-spirit-card.service';
import { HeavenlySpiritCardLog } from './entity/heavenly-spirit-card-log-entity.model';
import { MomentService } from 'src/utils/MomentService';
import { HeavenlySpiritCardController } from './fortune-stick.controller';
import { MemberPaymentModule } from 'src/member-payment/member-payment.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([HeavenlySpiritCard, HeavenlySpiritCardLog]),
    MemberPaymentModule,
  ],
  controllers: [HeavenlySpiritCardController],
  providers: [HeavenlySpiritCardService, MomentService],
  exports: [HeavenlySpiritCardService],
})
export class HeavenlySpiritCardModule {}
