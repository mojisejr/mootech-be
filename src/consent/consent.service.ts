import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consent } from './entity/consent-entity.model';
import { User } from 'src/user/entity/user-entity.model';
import { MomentService } from 'src/utils/MomentService';
import { ConsentCompleteOnboardingInput } from './dto/consent-complete-onboarding.input';

// The six first-run goals (GoalId), canonical source
// mootech-fe:features/v2-first-run/components/IntentCheckScreen.tsx. Anything else
// must never reach onboarding_goal.
const VALID_GOALS = ['finance', 'health', 'family', 'growth', 'love', 'work'];
// Server-owned PDPA policy versions we accept. Currently only 'v1'
// (mootech-fe:constants/pdpa.ts PDPA_POLICY_VERSION). Add the new value here when the
// policy wording is bumped — a consent row must always trace to a known policy text.
const VALID_POLICY_VERSIONS = ['v1'];

@Injectable()
export class ConsentService {
  constructor(
    @InjectRepository(Consent)
    private readonly consentRepository: Repository<Consent>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly momentWrapper: MomentService,
  ) {}

  /**
   * Reject calls to /consent that don't carry the BFF↔BE shared secret. This endpoint
   * writes a PDPA legal-consent record, so — like ai/consume — only a caller that holds
   * CONSENT_SECRET (our server-side onboarding BFF) can reach it; a direct curl from
   * outside cannot. This gates the CALLER, not the end user: `user_id` is still trusted
   * from the body (the BE has no user auth), so this does not prove the user consented —
   * the identity half is tracked in mootech-fe#252. Fail-closed: if CONSENT_SECRET is
   * unset, every call is rejected.
   */
  private assertConsentSecret(secret: string): void {
    const expected = process.env.CONSENT_SECRET;
    if (!expected || secret !== expected) {
      throw new HttpException(
        { code: 401, message: 'Unauthorized', error: 'Error' },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // Completes v2 first-run in one call: record the PDPA consent, set the chosen
  // goal, and stamp onboarded_at (the first-login gate). Additive writes only.
  async completeOnboarding(
    input: ConsentCompleteOnboardingInput,
    secret: string,
  ): Promise<any> {
    // Gate + validate BEFORE any DB write: an unauthorized caller is rejected, and an
    // authorized caller still cannot land an out-of-range goal/policy_version.
    this.assertConsentSecret(secret);
    if (!VALID_GOALS.includes(input.goal)) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: 'Invalid goal.' },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!VALID_POLICY_VERSIONS.includes(input.policy_version)) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: 'Invalid policy_version.' },
        HttpStatus.BAD_REQUEST,
      );
    }

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
