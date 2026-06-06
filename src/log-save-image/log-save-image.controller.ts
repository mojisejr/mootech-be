import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { LogSaveImageService } from './log-save-image.service';
import { LogSaveImageInsertInput } from './dto/log-save-image-insert.input';
@Controller('log-save-image')
export class LogSaveImageController {
  constructor(private readonly logSaveImageService: LogSaveImageService) {}

  @Post()
  @HttpCode(200)
  async insertLogActivity(
    @Body() input: LogSaveImageInsertInput,
  ): Promise<any> {
    return await this.logSaveImageService.insertLogActivity(input);
  }
}
