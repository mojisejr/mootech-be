import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';
import { ConsentService } from './consent.service';
import { ConsentCompleteOnboardingInput } from './dto/consent-complete-onboarding.input';

@Controller('consent')
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  // POST /consent — finish v2 first-run: record PDPA consent + goal + onboarded_at.
  // This writes a PDPA legal-consent record, so it is BFF↔BE secret-guarded (same
  // pattern as ai/consume): only a caller holding CONSENT_SECRET (our server-side
  // onboarding BFF) can reach it — a direct curl from outside cannot. This gates the
  // CALLER, not the end user: `user_id` is still trusted from the body (the BFF holds
  // the session; the BE has no user auth), so this does NOT prove the user consented —
  // that identity half is tracked separately (mootech-fe#252). `goal`/`policy_version`
  // are validated in the service BEFORE any DB write, so even an authorized caller
  // cannot land an out-of-range goal/policy (#16).
  @Post()
  @HttpCode(200)
  async completeOnboarding(
    @Body() input: ConsentCompleteOnboardingInput,
    @Headers('x-consent-secret') secret: string,
  ): Promise<any> {
    return await this.consentService.completeOnboarding(input, secret);
  }
}
