import { Module } from '@nestjs/common';
import { MomentService } from 'src/utils/MomentService';
import { CardService } from './card.service';
import { CardController } from './card.controller';
@Module({
  imports: [],
  controllers: [CardController],
  providers: [CardService, MomentService],
  exports: [CardService],
})
export class CardModule {}
