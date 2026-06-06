import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CardService } from './card.service';
@Controller('card')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post()
  @HttpCode(200)
  async generateImage(@Body() input: any): Promise<any> {
    return await this.cardService.generateImage(
      input.mascotUrl,
      input.description,
      input.title,
    );
  }

  @Post('preview')
  async generateImagePreview(
    @Body() body: { mascotUrl: string; description: string; title: string },
    @Res() res: Response,
  ) {
    const buffer = await this.cardService.generateImage(
      body.mascotUrl,
      body.description,
      body.title,
    );

    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Disposition', 'inline; filename=mumate_result.jpg'); // ✅ inline = แสดงบน browser/postman
    res.end(buffer);
  }
}
