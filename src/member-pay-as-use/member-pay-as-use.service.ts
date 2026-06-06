import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MomentService } from 'src/utils/MomentService';
import { MemberPayAsUseCreateInput } from './dto/member-pay-as-use-create.input';
import { MemberPayAsUse } from './entity/member-payment-as-use-entity.model';
import { LogMemberPayAsUse } from './entity/log-member-payment-as-use-entity.model';
@Injectable()
export class MemberPayAsUseService {
  constructor(
    @InjectRepository(MemberPayAsUse)
    private readonly memberPayAsUseRepository: Repository<MemberPayAsUse>,
    @InjectRepository(LogMemberPayAsUse)
    private readonly logMemberPayAsUseRepository: Repository<LogMemberPayAsUse>,
    private momentWrapper: MomentService,
  ) {}

  async createMemberPayAsUse(_input: MemberPayAsUseCreateInput): Promise<any> {
    const updateAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');

    const log = new LogMemberPayAsUse();
    log.create_at = updateAt;
    log.payment_id = _input.payment_id;
    log.total = _input.total;
    log.user_id = _input.user_id;
    await this.logMemberPayAsUseRepository.save(log);

    let now = await this.memberPayAsUseRepository.findOne({
      where: {
        user_id: _input.user_id,
      },
    });

    if (!now) {
      now = new MemberPayAsUse();
      now.user_id = _input.user_id;
      now.total = parseInt(_input.total + '');
    } else {
      now.total = now.total + parseInt(_input.total + '');
    }
    now.update_at = updateAt;
    const result = await this.memberPayAsUseRepository.save(now);
    return result;
  }

  async getMemberPayAsUse(userId: string): Promise<any> {
    const now = await this.memberPayAsUseRepository.findOne({
      where: {
        user_id: userId,
      },
    });

    return now;
  }
}
