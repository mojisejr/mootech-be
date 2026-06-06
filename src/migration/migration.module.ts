import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentService } from 'src/utils/MomentService';
import { User } from 'src/user/entity/user-entity.model';
import { UserProvider } from 'src/user-provider/entity/user-provider-entity.model';
import { MigrationService } from './migration.service';
import { MigrationController } from './migration.controller';
@Module({
  imports: [TypeOrmModule.forFeature([User, UserProvider])],
  controllers: [MigrationController],
  providers: [MigrationService, MomentService],
  exports: [MigrationService],
})
export class MigrationModule {}
