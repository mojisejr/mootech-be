import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { AiChatFortuneStickInput } from './dto/ai-chat-fortune-stick.input';
import { AiChatInput } from './dto/ai-chat.input';
import { AiConsumeInput } from './dto/ai-consume.input';
import { Response } from 'express';

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AiService) {}

  @Post('fortune-stick')
  @HttpCode(200)
  async chatAIFortuneStick(
    @Body() input: AiChatFortuneStickInput,
  ): Promise<any> {
    return await this.aiService.chatAIFortuneStick(input);
  }

  @Post('chat')
  @HttpCode(200)
  async chatAI(@Body() input: AiChatInput): Promise<any> {
    return await this.aiService.chatAI(input, false);
  }

  @Post('chat-streaming')
  @HttpCode(200)
  async chatAIStreaming(
    @Body() input: AiChatInput,
    @Res() res: Response,
  ): Promise<any> {
    return await this.aiService.chatAIStreaming(input, res);
  }

  // Wallet balance for the AI_GENERAL pool (read-only; consumed by the FE BFF/UI).
  @Get('balance/:user_id')
  @HttpCode(200)
  async getBalance(@Param('user_id') user_id: string): Promise<any> {
    return await this.aiService.getBalanceInfo(user_id);
  }

  // Spend one credit after a successful answer. Secret-guarded (BFF↔BE only).
  @Post('consume')
  @HttpCode(200)
  async consume(
    @Body() input: AiConsumeInput,
    @Headers('x-ai-secret') secret: string,
  ): Promise<any> {
    return await this.aiService.consumeCredit(input.user_id, secret);
  }
}
