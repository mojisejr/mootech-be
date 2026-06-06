import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsConfigService {
  constructor(private configService: ConfigService) {}

  get keyId(): string {
    return this.configService.get<string>('aws.accessKeyId');
  }

  get accessKey(): string {
    return this.configService.get<string>('aws.secretAccessKey');
  }

  get bucket(): string {
    return this.configService.get<string>('aws.s3RootBucket');
  }

  get bucketThumb(): string {
    return this.configService.get<string>('aws.s3ThumbRootBucket');
  }

  get signedUrlTimeout(): number {
    return Number(this.configService.get<number>('aws.s3SignedUrlTimeout'));
  }
}
