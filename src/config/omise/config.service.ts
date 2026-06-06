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
}
