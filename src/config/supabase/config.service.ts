import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseConfigService {
  constructor(private configService: ConfigService) {}

  get projectUrl(): string {
    return this.configService.get<string>('supabase.projectUrl');
  }

  get serviceRoleKey(): string {
    return this.configService.get<string>('supabase.serviceRoleKey');
  }

  get bucket(): string {
    return this.configService.get<string>('supabase.storageBucket');
  }

  get signedUrlTimeout(): number {
    return Number(this.configService.get<number>('supabase.signedUrlTimeout'));
  }
}
