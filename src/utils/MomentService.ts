import { Injectable } from '@nestjs/common';
import * as moment from 'moment-timezone';
@Injectable()
export class MomentService {
  moment(): moment.Moment {
    return moment().tz('Asia/Bangkok');
  }
  momentDate(date: string): moment.Moment {
    return moment().tz('Asia/Bangkok');
  }

  momentDateFromFormat(date: string, format: string): moment.Moment {
    return moment(date, format).tz('Asia/Bangkok');
  }

  momentFromDate(date: string): moment.Moment {
    return moment.tz(date, 'YYYY-MM-DD', true, 'Asia/Bangkok');
  }
}
