import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PowerKnowledge } from './entity/power-knowledge-entity.model';
import { PowerKnowledgeService } from './power-knowledge.service';
import { PowerKnowledgeDescription } from './entity/power-knowledge-description-entity.model';
@Module({
  imports: [
    TypeOrmModule.forFeature([PowerKnowledge, PowerKnowledgeDescription]),
  ],
  controllers: [],
  providers: [PowerKnowledgeService],
  exports: [PowerKnowledgeService],
})
export class PowerKnowledgeModule {}
