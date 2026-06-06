import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticCharacter } from './entity/analytic-character-entity.model';
import { AnalyticCharacterService } from './analytic-character.service';
@Module({
  imports: [TypeOrmModule.forFeature([AnalyticCharacter])],
  controllers: [],
  providers: [AnalyticCharacterService],
  exports: [AnalyticCharacterService],
})
export class AnalyticCharacterModule {}
