import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiChatFortuneStickInput } from './dto/ai-chat-fortune-stick.input';
import { AiChatInput } from './dto/ai-chat.input';
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
}
