import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PowerFinanceFortune } from './entity/power-finance-fortune-entity.model';
import { PowerFinanceService } from './power-finance.service';
import { PowerFinanceDescription } from './entity/power-finance-description-entity.model';
import { PowerFinance } from './entity/power-finance-entity.model';
import { PowerFinanceExtra } from './entity/power-finance-extra-entity.model';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      PowerFinance,
      PowerFinanceFortune,
      PowerFinanceDescription,
      PowerFinanceExtra,
    ]),
  ],
  controllers: [],
  providers: [PowerFinanceService],
  exports: [PowerFinanceService],
})
export class PowerFinanceModule {}
