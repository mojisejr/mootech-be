import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AwsConfigService } from 'src/config/aws';
import * as AWS from 'aws-sdk';
import { MomentService } from 'src/utils/MomentService';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
@Injectable()
export class ObjectStorageService {
  private s3: AWS.S3;
  private s3RootBucket: string;
  private s3Thumb: AWS.S3;
  private s3ThumbRootBucket: string;

  constructor(
    private awsConfigService: AwsConfigService,
    private momentWrapper: MomentService,
    private readonly httpService: HttpService,
  ) {}

  onModuleInit() {
    this.s3RootBucket = this.awsConfigService.bucket;
    this.s3 = new AWS.S3({
      accessKeyId: this.awsConfigService.keyId,
      secretAccessKey: this.awsConfigService.accessKey,
      region: 'ap-southeast-1',
    });

    this.s3ThumbRootBucket = this.awsConfigService.bucketThumb;
    this.s3Thumb = new AWS.S3({
      accessKeyId: this.awsConfigService.keyId,
      secretAccessKey: this.awsConfigService.accessKey,
      region: 'ap-southeast-1',
    });
  }

  public async uploadFile(files): Promise<any> {
    const fileOrigin = files.file[0];
    const fileBuffer = fileOrigin.buffer;
    const fileMimeType = fileOrigin.mimetype;
    const isDemo = process.env.AWS_S3_ROOT_DIRECTORY;
    let s3Key = `${isDemo}${'mumate/profile/'}${this.momentWrapper
      .moment()
      .format('YYYYMMDDHHmmss')}_${Math.floor(Math.random() * 1000)}`;

    if (fileMimeType === 'image/jpeg') {
      // console.log('fileMimeType: JPEG');
      s3Key = s3Key + '.jpg';
      const s3Response = await this.putObject({
        s3Key: s3Key,
        body: fileBuffer,
        mimetype: 'image/jpeg',
      });
      console.log(s3Response);
    } else if (fileMimeType === 'image/png') {
      // console.log('fileMimeType: PNG');
      s3Key = s3Key + '.png';
      const s3Response = await this.putObject({
        s3Key: s3Key,
        body: fileBuffer,
        mimetype: 'image/png',
      });
      console.log('s3Response response');
      console.log(s3Response);
    } else {
      console.log('fileMimeType: OTHER = ' + fileMimeType);
      s3Key = s3Key + '.' + fileMimeType;
      const s3Response = await this.putObject({
        s3Key: s3Key,
        body: fileBuffer,
        mimetype: fileMimeType,
      });
    }

    const objectStorageS3 = {
      s3_key: `${process.env.AWS_S3_ENDPOINT}/${s3Key}`,
    };

    // console.log(objectStorageS3);
    return objectStorageS3;
  }

  public async uploadSlip(files): Promise<any> {
    const fileOrigin = files.file[0];
    const fileBuffer = fileOrigin.buffer;
    const fileMimeType = fileOrigin.mimetype;
    const extension = fileMimeType.split('/')[1];
    const isDemo = process.env.AWS_S3_ROOT_DIRECTORY;
    let s3Key = `${isDemo}${'mumate/slip/'}${this.momentWrapper
      .moment()
      .format('YYYYMMDDHHmmss')}_${Math.floor(Math.random() * 1000)}`;

    s3Key = s3Key + '.' + extension;
    const s3Response = await this.putObject({
      s3Key: s3Key,
      body: fileBuffer,
      mimetype: fileOrigin.mimetype,
    });
    console.log('s3Response response');
    console.log(s3Response);

    const objectStorageS3 = {
      s3_key: `${process.env.AWS_S3_ENDPOINT}/${s3Key}`,
    };

    // console.log(objectStorageS3);
    return objectStorageS3;
  }

  public async putObject({
    s3Key,
    body,
    mimetype,
  }: {
    s3Key: string;
    body: Buffer;
    mimetype: string;
  }): Promise<any> {
    const params = {
      Bucket: this.s3RootBucket,
      Key: String(s3Key),
      Body: body,
      ACL: 'public-read',
      ContentType: mimetype,
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: 'ap-southeast-1',
      },
    };
    console.log(params);
    try {
      const responseS3 = await this.s3.upload(params).promise();
      return responseS3;
    } catch (e) {
      console.log(e);
    }
    return null;
  }

  public async putObjectThumb({
    s3Key,
    body,
  }: {
    s3Key: string;
    body: Buffer;
  }): Promise<any> {
    // const responseS3 = await this.s3Thumb.putObject({
    //   Bucket: this.s3ThumbRootBucket,
    //   Key: s3Key,
    //   Body: body,
    //   ACL: 'public-read',
    //   ContentType: 'image/png',
    // });
    // return responseS3;\

    const params = {
      Bucket: this.s3ThumbRootBucket,
      Key: String(s3Key),
      Body: body,
      ACL: 'public-read',
      ContentType: 'image/png',
      ContentDisposition: 'inline',
      CreateBucketConfiguration: {
        LocationConstraint: 'ap-southeast-1',
      },
    };

    try {
      const responseS3 = await this.s3Thumb.upload(params).promise();
      return responseS3;
    } catch (e) {
      console.log(e);
    }
    return null;
  }

  async getSignedUrl(key: string, is_origin: boolean): Promise<string> {
    return this.s3.getSignedUrl('getObject', {
      Bucket: is_origin ? this.s3RootBucket : this.s3ThumbRootBucket,
      Key: key,
      Expires: Number(3600), //  24 hr  the number of seconds to expire
    });
  }

  async downloadLineImageToS3(imageUrl: string) {
    const timeout = Number(process.env.PV_TIMEOUT ?? 30000);

    // 1) download -> arraybuffer -> Buffer
    const { fileBuffer, contentType } = await firstValueFrom(
      this.httpService
        .get(imageUrl, {
          responseType: 'arraybuffer', // ✅ สำคัญ: ให้ได้ binary
          timeout,
          maxRedirects: 5,
          headers: {
            'User-Agent': 'Mozilla/5.0',
            Accept: 'image/*,*/*;q=0.8',
          },
        })
        .pipe(
          map((res) => {
            const ct =
              (res.headers?.['content-type'] as string) ||
              'application/octet-stream';

            // axios ใน Nest HttpService จะให้ res.data เป็น ArrayBuffer
            const buffer = Buffer.from(res.data);

            return { fileBuffer: buffer, contentType: ct };
          }),
          catchError((e) => {
            console.log(e?.response?.status, e?.message);
            throw new HttpException(
              { status: 400, error: 'ไม่สามารถดาวน์โหลดรูปจาก LINE ได้' },
              HttpStatus.BAD_REQUEST,
            );
          }),
        ),
    );

    // 2) เดานามสกุลจาก content-type
    const ext = contentType.includes('png')
      ? 'png'
      : contentType.includes('webp')
      ? 'webp'
      : contentType.includes('gif')
      ? 'gif'
      : 'jpg';

    // 3) ตั้งชื่อไฟล์
    const s3Key = `profile-images/${Date.now()}_${Math.floor(
      Math.random() * 1000,
    )}.${ext}`;

    // 4) upload to S3 (ใช้ putObject เดิมของคุณ)
    const s3Response = await this.putObject({
      s3Key,
      body: fileBuffer,
      mimetype: contentType, // ✅ ส่ง content-type ไปเลย
    });

    return {
      s3Key,
      contentType,
      size: fileBuffer.length,
      s3Response,
    };
  }
}
