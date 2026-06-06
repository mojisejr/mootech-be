import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentService } from 'src/utils/MomentService';
import { UserProvider } from './entity/user-provider-entity.model';
import { UserProviderService } from './user-provider.service';
@Module({
  imports: [TypeOrmModule.forFeature([UserProvider])],
  controllers: [],
  providers: [UserProviderService, MomentService],
  exports: [UserProviderService],
})
export class UserProviderModule {}
