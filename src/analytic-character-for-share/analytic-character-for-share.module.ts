import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticCharacterForShare } from './entity/analytic-character-for-share-entity.model';
import { AnalyticCharacterForShareService } from './analytic-character-for-share.service';
@Module({
  imports: [TypeOrmModule.forFeature([AnalyticCharacterForShare])],
  controllers: [],
  providers: [AnalyticCharacterForShareService],
  exports: [AnalyticCharacterForShareService],
})
export class AnalyticCharacterForShareModule {}
