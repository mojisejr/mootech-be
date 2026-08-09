import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentService } from 'src/utils/MomentService';
import { Consent } from './entity/consent-entity.model';
import { User } from 'src/user/entity/user-entity.model';
import { ConsentService } from './consent.service';
import { ConsentController } from './consent.controller';

// forFeature([Consent, User]): consent completion writes both tables in one call.
// Registering User's repo here (in addition to UserModule) is standard TypeORM.
@Module({
  imports: [TypeOrmModule.forFeature([Consent, User])],
  providers: [ConsentService, MomentService],
  controllers: [ConsentController],
  exports: [ConsentService],
})
export class ConsentModule {}
