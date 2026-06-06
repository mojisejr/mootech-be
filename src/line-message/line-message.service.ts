import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { catchError, firstValueFrom, map } from 'rxjs';
import { LineMessageConfigService } from 'src/config/line-message';

@Injectable()
export class LineMessageService {
  constructor(
    private readonly httpService: HttpService,
    private lineMessageConfigService: LineMessageConfigService,
  ) {}
  async checkUserId(lineUserId: string) {
    const headers = {
      Authorization: `Bearer ${this.lineMessageConfigService.token}`,
    };

    try {
      const data = await firstValueFrom(
        this.httpService
          .get(`${this.lineMessageConfigService.host}/profile/${lineUserId}`, {
            headers,
            timeout: Number(process.env.PV_TIMEOUT ?? 15000),
          })
          .pipe(map((res) => res.data)),
      );

      return { ok: true, profile: data };
    } catch (e: any) {
      const status = e?.response?.status ?? 0;
      const lineData = e?.response?.data;

      // แยกเคสให้ชัด
      if (status === 404) {
        // ไม่สามารถเข้าถึงโปรไฟล์ user นี้ใน channel นี้ (อาจไม่เคยคุย/หรือคนละ channel)
        return {
          ok: false,
          reason: 'PROFILE_NOT_FOUND',
          status,
          line: lineData,
        };
      }

      if (status === 401 || status === 403) {
        // token ผิด/หมดอายุ/ไม่มีสิทธิ์ หรือ user ไม่อยู่ในเงื่อนไขที่เข้าถึงได้
        return {
          ok: false,
          reason: 'UNAUTHORIZED_OR_FORBIDDEN',
          status,
          line: lineData,
        };
      }

      if (e?.code === 'ECONNABORTED') {
        return {
          ok: false,
          reason: 'TIMEOUT',
          status,
          line: lineData ?? e.message,
        };
      }

      return {
        ok: false,
        reason: 'LINE_ERROR',
        status,
        line: lineData ?? e.message,
      };
    }
  }

  async multicastText(userIds: string[], message: string) {
    if (!this.lineMessageConfigService.token) {
      throw new HttpException(
        { status: 500, error: 'LINE token not configured' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const chunks = chunkArray(userIds, 400);

    const results: any[] = [];

    for (const to of chunks) {
      const body = {
        to,
        messages: [{ type: 'text', text: message }],
      };

      const headers = {
        Authorization: `Bearer ${this.lineMessageConfigService.token}`,
        'Content-Type': 'application/json',
      };
      const response = await firstValueFrom(
        this.httpService
          .post(
            `${this.lineMessageConfigService.host}/message/multicast`,
            body,
            {
              headers,
              timeout: parseInt(process.env.PV_TIMEOUT || '15000', 10),
            },
          )
          .pipe(
            map((res: any) => res.data),
            catchError((e) => {
              const status = e?.response?.status;
              const data = e?.response?.data;

              // โยน error ที่อ่านง่าย + แนบของจริงไว้ debug
              throw new HttpException(
                {
                  status: status || 400,
                  error: 'ไม่สามารถส่ง LINE ได้',
                  line: data || e?.message,
                },
                HttpStatus.BAD_REQUEST,
              );
            }),
          ),
      );

      results.push(response); // ปกติ LINE จะคืน {} ถ้าสำเร็จ
    }

    return {
      ok: true,
      totalUsers: userIds.length,
      batches: chunks.length,
      results,
    };
  }
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
