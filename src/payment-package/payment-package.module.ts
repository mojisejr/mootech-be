import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentService } from 'src/utils/MomentService';
import { PaymentPackage } from './entity/payment-package-entity.model';
import { PaymentPackageService } from './payment-package.service';
import { PaymentPackageController } from './payment-package.controller';
@Module({
  imports: [TypeOrmModule.forFeature([PaymentPackage])],
  controllers: [PaymentPackageController],
  providers: [PaymentPackageService, MomentService],
  exports: [PaymentPackageService],
})
export class PaymentPackageModule {}
