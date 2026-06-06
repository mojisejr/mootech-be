import { Injectable } from '@nestjs/common';
import { createCanvas, loadImage, registerFont } from 'canvas';
import * as path from 'path';

registerFont(
  path.join(process.cwd(), 'src/assets/fonts/IBMPlexSansThai-Regular.ttf'),
  {
    family: 'IBM Plex Sans Thai',
    weight: 'normal',
  },
);
registerFont(
  path.join(process.cwd(), 'src/assets/fonts/IBMPlexSansThai-Bold.ttf'),
  {
    family: 'IBM Plex Sans Thai',
    weight: 'bold',
  },
);
@Injectable()
export class CardService {
  async generateImage(
    mascotUrl: string,
    description: string,
    title: string,
  ): Promise<Buffer> {
    console.log('START');

    const canvasWidth = 1080;
    const canvasHeight = 1920;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx: any = canvas.getContext('2d');
    console.log('START 0');
    // ✅ พื้นหลัง
    const bg = await loadImage(
      path.join(process.cwd(), 'public/images/mumate/img_bg_home.jpg'),
    );
    ctx.drawImage(bg, 0, 0, canvasWidth, canvasHeight);
    console.log('START 1');
    // ✅ โลโก้
    const logo = await loadImage(
      path.join(process.cwd(), 'public/images/mumate/ic_logo.png'),
    );
    ctx.drawImage(logo, (canvasWidth - 400) / 2, 40, 400, 95);
    console.log('START 2');

    // ✅ ข้อความบนสุด เหนือ mascot
    const topText = title;
    ctx.font = 'bold 50px "IBM Plex Sans Thai"';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(topText, canvasWidth / 2, 160);
    console.log('START 3');

    // ✅ เตรียมข้อมูล scale & position
    console.log(mascotUrl);
    const mascot = await loadImage(mascotUrl);
    const maxW = 700;
    const maxH = 1236;
    const scale = Math.min(maxW / mascot.width, maxH / mascot.height);
    const w = mascot.width * scale;
    const h = mascot.height * scale;
    const x = (canvasWidth - w) / 2;
    const y = 260;
    console.log('START 4');

    // ✅ วาดเงา (shadow)
    ctx.save(); // เก็บ context เดิม
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 15;
    console.log('START 5');

    // ✅ ตัดภาพให้มีขอบมน (clip round)
    const radius = 32;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    // ✅ ใช้ clipping และวาดภาพ
    ctx.clip();
    ctx.drawImage(mascot, x, y, w, h);

    ctx.restore(); // คืน context เดิม (เงาจะไม่ไปรบกวนอย่างอื่น)
    // ✅ ข้อความหลัก (description)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px "IBM Plex Sans Thai"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const descX = canvasWidth / 2;
    const descY = y + h + 60;
    this.drawMultilineText(
      ctx,
      description,
      descX,
      descY,
      canvasWidth - 160,
      60,
    );
    // ✅ QR Code config
    const qrSize = 180;
    const qrMargin = 60; // margin from right and bottom
    const qrX = canvasWidth - qrSize - qrMargin;
    const qrY = canvasHeight - qrSize - qrMargin;

    // ✅ วาด QR Code
    const qr = await loadImage(
      path.join(process.cwd(), 'public/images/mumate/ic_qr_mumate.png'),
    );
    ctx.drawImage(qr, qrX, qrY, qrSize, qrSize);
    console.log('START 6');

    // ✅ คำนวณ baseline กลางของ QR
    const textCenterY = qrY + qrSize / 2;

    // ✅ "ค้นหาตัวเองได้ที่ IG : @mumate.co" อยู่ซ้ายสุด
    ctx.font = 'normal 36px "IBM Plex Sans Thai"';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('ค้นหาตัวเองได้ที่ IG : @mumate.co', 60, textCenterY - 18);
    console.log('START 7');

    // ✅ "ลองเลย!" อยู่ด้านซ้ายของ QR Code
    ctx.font = 'bold 36px "IBM Plex Sans Thai"';
    const tryText = 'ลองเลย!';
    const tryTextMetrics = ctx.measureText(tryText);
    const tryTextWidth = tryTextMetrics.width;
    const tryTextX = qrX - tryTextWidth - 20; // 20px space before QR
    ctx.fillText(tryText, tryTextX, textCenterY - 18);

    console.log('TEST');

    return canvas.toBuffer('image/jpeg');
  }
  private drawMultilineText(
    ctx: CanvasRenderingContext2D,
    text: string,
    centerX: number,
    startY: number,
    maxWidth: number,
    lineHeight: number,
  ) {
    const words = text.split(' ');
    let line = '';
    let y = startY;
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && i > 0) {
        ctx.fillText(line.trim(), centerX, y);
        line = words[i] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), centerX, y);
  }
}
