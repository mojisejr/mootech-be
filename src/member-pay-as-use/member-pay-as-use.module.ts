import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentService } from 'src/utils/MomentService';
import { MemberPayAsUse } from './entity/member-payment-as-use-entity.model';
import { LogMemberPayAsUse } from './entity/log-member-payment-as-use-entity.model';
import { MemberPayAsUseService } from './member-pay-as-use.service';
@Module({
  imports: [TypeOrmModule.forFeature([MemberPayAsUse, LogMemberPayAsUse])],
  controllers: [],
  providers: [MemberPayAsUseService, MomentService],
  exports: [MemberPayAsUseService],
})
export class MemberPayAsUseModule {}
