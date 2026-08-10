import { Body, Controller, Headers, HttpCode, Post } from '@nestjs/common';
import { ConsentService } from './consent.service';
import { ConsentCompleteOnboardingInput } from './dto/consent-complete-onboarding.input';

@Controller('consent')
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  // POST /consent — finish v2 first-run: record PDPA consent + goal + onboarded_at.
  // This writes a PDPA legal-consent record, so it is BFF↔BE secret-guarded (same
  // pattern as ai/consume): only our onboarding BFF — which already authenticated the
  // user's session — can call it. `goal`/`policy_version` are validated in the service
  // BEFORE any DB write so a forged payload can never land a bogus consent row (#16).
  @Post()
  @HttpCode(200)
  async completeOnboarding(
    @Body() input: ConsentCompleteOnboardingInput,
    @Headers('x-consent-secret') secret: string,
  ): Promise<any> {
    return await this.consentService.completeOnboarding(input, secret);
  }
}
