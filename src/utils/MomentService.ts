import { Injectable } from '@nestjs/common';
import * as moment from 'moment-timezone';
@Injectable()
export class MomentService {
  moment(): moment.Moment {
    return moment().tz('Asia/Bangkok');
  }
  momentDate(date: string): moment.Moment {
    // Parse the given date (date-only). Previously ignored its argument and returned
    // now() — masked only because callers pass today. #mootech-mysql-pg-migration-audit
    return moment.tz(String(date).slice(0, 10), 'YYYY-MM-DD', 'Asia/Bangkok');
  }

  momentDateFromFormat(date: string, format: string): moment.Moment {
    return moment(date, format).tz('Asia/Bangkok');
  }

  momentFromDate(date: string): moment.Moment {
    // Tolerate values stored as full timestamps ('YYYY-MM-DD HH:mm:ss') by parsing the
    // leading date only; strict mode would reject them and falsely report "expired".
    // #mootech-mysql-pg-migration-audit
    return moment.tz(
      String(date).slice(0, 10),
      'YYYY-MM-DD',
      true,
      'Asia/Bangkok',
    );
  }
}
