import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LineMessageConfigService {
  constructor(private configService: ConfigService) {}

  get host(): string {
    return this.configService.get<string>('lineMessage.host');
  }

  get token(): string {
    return this.configService.get<string>('lineMessage.token');
  }
}
