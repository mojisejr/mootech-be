import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SupabaseConfigService } from 'src/config/supabase';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { MomentService } from 'src/utils/MomentService';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';

/**
 * Object storage backed by Supabase Storage (migrated from AWS S3).
 *
 * Public method signatures and return shapes are preserved 1:1 with the old
 * S3 implementation so consumers (user/payment/chinese-horoscope services) are
 * untouched:
 *   - putObject / putObjectThumb / downloadLineImageToS3 return objects exposing
 *     `.Location` (the public URL) — historically the AWS upload Location.
 *   - uploadFile / uploadSlip return `{ s3_key }` (the public URL).
 *   - getSignedUrl returns a signed URL string.
 */
@Injectable()
export class ObjectStorageService {
  private supabase: SupabaseClient;
  private bucket: string;

  constructor(
    private supabaseConfigService: SupabaseConfigService,
    private momentWrapper: MomentService,
    private readonly httpService: HttpService,
  ) {}

  onModuleInit() {
    // @supabase/supabase-js (realtime-js) needs a global WebSocket. The Render
    // image runs Node 19 (no native WebSocket), so polyfill with `ws` before
    // createClient to avoid "Node.js 19 detected without native WebSocket support".
    if (typeof (globalThis as any).WebSocket === 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      (globalThis as any).WebSocket = require('ws');
    }
    this.bucket = this.supabaseConfigService.bucket;
    this.supabase = createClient(
      this.supabaseConfigService.projectUrl,
      this.supabaseConfigService.serviceRoleKey,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }

  private publicUrl(key: string): string {
    const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(key);
    return data.publicUrl;
  }

  public async uploadFile(files): Promise<any> {
    const fileOrigin = files.file[0];
    const fileBuffer = fileOrigin.buffer;
    const fileMimeType = fileOrigin.mimetype;
    let s3Key = `mumate/profile/${this.momentWrapper
      .moment()
      .format('YYYYMMDDHHmmss')}_${Math.floor(Math.random() * 1000)}`;

    if (fileMimeType === 'image/jpeg') {
      s3Key = s3Key + '.jpg';
    } else if (fileMimeType === 'image/png') {
      s3Key = s3Key + '.png';
    } else {
      s3Key = s3Key + '.' + fileMimeType;
    }

    await this.putObject({
      s3Key: s3Key,
      body: fileBuffer,
      mimetype: fileMimeType,
    });

    return { s3_key: this.publicUrl(s3Key) };
  }

  public async uploadSlip(files): Promise<any> {
    const fileOrigin = files.file[0];
    const fileBuffer = fileOrigin.buffer;
    const fileMimeType = fileOrigin.mimetype;
    const extension = fileMimeType.split('/')[1];
    let s3Key = `mumate/slip/${this.momentWrapper
      .moment()
      .format('YYYYMMDDHHmmss')}_${Math.floor(Math.random() * 1000)}`;

    s3Key = s3Key + '.' + extension;
    await this.putObject({
      s3Key: s3Key,
      body: fileBuffer,
      mimetype: fileMimeType,
    });

    return { s3_key: this.publicUrl(s3Key) };
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
    const key = String(s3Key);
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(key, body, { contentType: mimetype, upsert: true });
    if (error) {
      console.log(error);
      return null;
    }
    // Mirror the old AWS S3 upload response shape (consumers read `.Location`).
    return { Location: this.publicUrl(key), Key: key, Bucket: this.bucket };
  }

  public async putObjectThumb({
    s3Key,
    body,
  }: {
    s3Key: string;
    body: Buffer;
  }): Promise<any> {
    const key = String(s3Key);
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(key, body, { contentType: 'image/png', upsert: true });
    if (error) {
      console.log(error);
      return null;
    }
    return { Location: this.publicUrl(key), Key: key, Bucket: this.bucket };
  }

  async getSignedUrl(key: string, is_origin: boolean): Promise<string> {
    const expiresIn = this.supabaseConfigService.signedUrlTimeout || 3600;
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .createSignedUrl(key, expiresIn);
    if (error || !data) {
      console.log(error);
      return '';
    }
    return data.signedUrl;
  }

  async downloadLineImageToS3(imageUrl: string) {
    const timeout = Number(process.env.PV_TIMEOUT ?? 30000);

    // 1) download -> arraybuffer -> Buffer
    const { fileBuffer, contentType } = await firstValueFrom(
      this.httpService
        .get(imageUrl, {
          responseType: 'arraybuffer',
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

    // 2) guess extension from content-type
    const ext = contentType.includes('png')
      ? 'png'
      : contentType.includes('webp')
      ? 'webp'
      : contentType.includes('gif')
      ? 'gif'
      : 'jpg';

    // 3) build key
    const s3Key = `profile-images/${Date.now()}_${Math.floor(
      Math.random() * 1000,
    )}.${ext}`;

    // 4) upload to storage (same putObject as before)
    const s3Response = await this.putObject({
      s3Key,
      body: fileBuffer,
      mimetype: contentType,
    });

    return {
      s3Key,
      contentType,
      size: fileBuffer.length,
      s3Response,
    };
  }
}
