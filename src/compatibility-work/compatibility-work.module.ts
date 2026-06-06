import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompatibilityWork } from './entity/compatibility-work-entity.model';
import { CompatibilityWorkRating } from './entity/compatibility-work-rating-entity.model';
import { CompatibilityWorkDescription } from './entity/compatibility-work-description-entity.model';
import { CompatibilityWorkService } from './compatibility-work.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompatibilityWork,
      CompatibilityWorkRating,
      CompatibilityWorkDescription,
    ]),
  ],
  controllers: [],
  providers: [CompatibilityWorkService],
  exports: [CompatibilityWorkService],
})
export class CompatibilityWorkModule {}
