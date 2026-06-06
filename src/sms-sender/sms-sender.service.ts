import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { catchError, firstValueFrom, map } from 'rxjs';
import { SMS8x8ConfigService } from 'src/config/sms8x8';
import { MomentService } from 'src/utils/MomentService';
import { SMSSendSMSInput } from './dto/sms-send-sms-input';
import { SMSSenderResponse } from './model/sms-sender-response.model';

@Injectable()
export class SmsSenderService {
  constructor(
    private httpService: HttpService,
    private momentWrapper: MomentService,
    private sMS8x8ConfigService: SMS8x8ConfigService,
  ) {}

  private headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  private getTelFormat8x8(tel: string) {
    const pos = tel.indexOf('66');
    if (pos === 0) {
      return '+' + tel;
    }
    return '+66' + tel.substring(1);
  }

  public async sendSMS(input: SMSSendSMSInput) {
    console.log('sendSMS');
    console.log(input);
    const result = await this.send8x8SMS(input);
    return result;
  }

  public async send8x8SMS(input: SMSSendSMSInput) {
    if (input.message && input.tel) {
      const body = {
        source: this.sMS8x8ConfigService.topic,
        destination: this.getTelFormat8x8(input.tel),
        text: input.message,
        encoding: this.sMS8x8ConfigService.encoding,
      };
      console.log(body);
      const headers = {
        Authorization: 'Bearer ' + this.sMS8x8ConfigService.token,
      };
      const response = await firstValueFrom(
        this.httpService
          .post(this.sMS8x8ConfigService.host, body, {
            headers: headers,
            timeout: parseInt(process.env.PV_TIMEOUT),
          })
          .pipe(
            map((response: any) => {
              // console.log(response);
              return response.data;
            }),
            catchError((e) => {
              console.log(e);
              throw new HttpException(
                {
                  status: 401,
                  error: 'ไม่สามารถส่ง SMS ได้',
                },
                HttpStatus.BAD_REQUEST,
              );
            }),
          ),
      );
      const result: SMSSenderResponse | any = response;
      console.log('result sms : 8x8');
      console.log(result);
      if (result.umid) {
        return { status: 200 };
      } else {
        throw new HttpException(
          {
            status: 401,
            error: 'ไม่สามารถส่ง SMS ได้',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    return '';
  }
}
