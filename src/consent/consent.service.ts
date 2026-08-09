import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consent } from './entity/consent-entity.model';
import { User } from 'src/user/entity/user-entity.model';
import { MomentService } from 'src/utils/MomentService';
import { ConsentCompleteOnboardingInput } from './dto/consent-complete-onboarding.input';

@Injectable()
export class ConsentService {
  constructor(
    @InjectRepository(Consent)
    private readonly consentRepository: Repository<Consent>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly momentWrapper: MomentService,
  ) {}

  // Completes v2 first-run in one call: record the PDPA consent, set the chosen
  // goal, and stamp onboarded_at (the first-login gate). Additive writes only.
  async completeOnboarding(
    input: ConsentCompleteOnboardingInput,
  ): Promise<any> {
    const now = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');

    const user = await this.userRepository.findOne({
      where: { user_id: input.user_id },
    });
    if (!user) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: 'User not found.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // 1. consent history row (append — never overwrite a prior acceptance)
    const consent = new Consent();
    consent.user_id = input.user_id;
    consent.accepted_at = now;
    consent.policy_version = input.policy_version;
    await this.consentRepository.save(consent);

    // 2. user: goal + first-login gate. Idempotent by intent — re-completing just
    //    refreshes goal and keeps the gate closed.
    user.onboarding_goal = input.goal;
    user.onboarded_at = now;
    await this.userRepository.save(user);

    return { ok: true, onboarded_at: now, onboarding_goal: input.goal };
  }
}
