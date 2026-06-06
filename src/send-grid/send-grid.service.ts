import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { SendGridSendEmailInput } from './dto/send-grid-email-input';

@Injectable()
export class SendGridService {
  private readonly fromEmail = process.env.SENDGRID_FROM_EMAIL!;
  private readonly fromName = process.env.SENDGRID_FROM_NAME || 'No-Reply';

  constructor() {
    const key = process.env.SENDGRID_API_KEY;
    if (!key) {
    } else {
      sgMail.setApiKey(key);
    }
  }

  public async sendEmail(input: SendGridSendEmailInput) {
    const msg = {
      to: input.to,
      from: { email: this.fromEmail, name: this.fromName },
      templateId: input.templateId,
      dynamicTemplateData: input.payload,
    };
    console.log(msg);
    try {
      await sgMail.send(msg as any);
      return { ok: true };
    } catch (err: any) {
      const status = err?.code || err?.response?.statusCode;
      const body = err?.response?.body;
      console.log('SendGrid error status:', status);
      console.log('SendGrid error body:', JSON.stringify(body));
      throw err;
    }
  }
}
