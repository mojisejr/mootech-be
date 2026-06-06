import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PowerCustomer } from './entity/power-customer-entity.model';
import { PowerCustomerDescription } from './entity/power-customer-description-entity.model';
import { PowerCustomerInput } from './dto/power-customer.input';

@Injectable()
export class PowerCustomerService {
  constructor(
    @InjectRepository(PowerCustomer)
    private readonly powerCustomerRepository: Repository<PowerCustomer>,
    @InjectRepository(PowerCustomerDescription)
    private readonly powerCustomerDescriptionRepository: Repository<PowerCustomerDescription>,
  ) {}

  async getAnalytic(_input: PowerCustomerInput): Promise<any> {
    const result = await this.powerCustomerRepository.findOne({
      where: {
        day_above_id: _input.day_above_id,
        day_below_id: _input.day_below_id,
        year_above_id: _input.year_above_id,
        year_below_id: _input.year_below_id,
      },
    });
    if (result) {
      const codes = JSON.parse(result.details);
      const uniqueCodes = [...new Set(codes)];
      const resultDesc = await this.powerCustomerDescriptionRepository
        .createQueryBuilder('power_customer_description')
        .select('power_customer_description.note', 'note')
        .where('code IN (:...code)', { code: uniqueCodes })
        .getRawMany();
      return {
        result: result,
        desc: resultDesc,
      };
    }

    return result;
  }
}
