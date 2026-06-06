import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Color } from './entity/color-entity.model';
import { ColorService } from './color.service';
@Module({
  imports: [TypeOrmModule.forFeature([Color])],
  controllers: [],
  providers: [ColorService],
  exports: [ColorService],
})
export class ColorModule {}
