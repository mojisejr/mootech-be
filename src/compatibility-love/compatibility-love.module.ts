import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompatibilityLove } from './entity/compatibility-love-entity.model';
import { CompatibilityLoveService } from './compatibility-love.service';
import { CompatibilityLoveRating } from './entity/compatibility-love-rating-entity.model';
import { CompatibilityLoveDescription } from './entity/compatibility-love-description-entity.model';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CompatibilityLove,
      CompatibilityLoveRating,
      CompatibilityLoveDescription,
    ]),
  ],
  controllers: [],
  providers: [CompatibilityLoveService],
  exports: [CompatibilityLoveService],
})
export class CompatibilityLoveModule {}
