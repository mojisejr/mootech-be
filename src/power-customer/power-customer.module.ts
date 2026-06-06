import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PowerCustomer } from './entity/power-customer-entity.model';
import { PowerCustomerService } from './power-customer.service';
import { PowerCustomerDescription } from './entity/power-customer-description-entity.model';
@Module({
  imports: [
    TypeOrmModule.forFeature([PowerCustomer, PowerCustomerDescription]),
  ],
  controllers: [],
  providers: [PowerCustomerService],
  exports: [PowerCustomerService],
})
export class PowerCustomerModule {}
