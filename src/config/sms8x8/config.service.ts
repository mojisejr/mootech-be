import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SMS8x8ConfigService {
  constructor(private configService: ConfigService) {}

  get host(): string {
    return this.configService.get<string>('sms8x8.host');
  }

  get token(): string {
    return this.configService.get<string>('sms8x8.token');
  }

  get topic(): string {
    return this.configService.get<string>('sms8x8.topic');
  }

  get encoding(): string {
    return this.configService.get<string>('sms8x8.encoding');
  }
}
