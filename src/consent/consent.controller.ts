import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ConsentService } from './consent.service';
import { ConsentCompleteOnboardingInput } from './dto/consent-complete-onboarding.input';

@Controller('consent')
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  // POST /consent — finish v2 first-run: record PDPA consent + goal + onboarded_at.
  @Post()
  @HttpCode(200)
  async completeOnboarding(
    @Body() input: ConsentCompleteOnboardingInput,
  ): Promise<any> {
    return await this.consentService.completeOnboarding(input);
  }
}
