import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OmiseConfigService {
  constructor(private configService: ConfigService) {}

  get publicKey(): string {
    return this.configService.get<string>('omise.pub');
  }

  get secret(): string {
    return this.configService.get<string>('omise.secret');
  }

  get returnUri(): string {
    return this.configService.get<string>('omise.return_uri');
  }

  // Base64-encoded HMAC secret from the Omise dashboard (Settings → Webhooks).
  // Used to verify the Omise-Signature on incoming webhooks. May be undefined
  // until the operator sets OMISE_WEBHOOK_SECRET — verification fails closed.
  get webhookSecret(): string {
    return this.configService.get<string>('omise.webhook_secret');
  }
}
