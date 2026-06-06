import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PowerEducation } from './entity/power-education-entity.model';
import { PowerEducationService } from './power-education.service';
import { PowerEducationDescription } from './entity/power-education-description-entity.model';
@Module({
  imports: [
    TypeOrmModule.forFeature([PowerEducation, PowerEducationDescription]),
  ],
  controllers: [],
  providers: [PowerEducationService],
  exports: [PowerEducationService],
})
export class PowerEducationModule {}
