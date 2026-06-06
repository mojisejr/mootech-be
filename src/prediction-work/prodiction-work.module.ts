import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PredictionWork } from './entity/prediction-work-entity.model';
import { PredictionWorkDescription } from './entity/prediction-description-entity.model';
import { PredictionWorkService } from './prediction-work.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([PredictionWork, PredictionWorkDescription]),
  ],
  controllers: [],
  providers: [PredictionWorkService],
  exports: [PredictionWorkService],
})
export class PredictionWorkModule {}
