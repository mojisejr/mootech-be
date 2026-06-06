import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Holiday } from './entity/holiday-entity.model';

@Injectable()
export class HolidayService {
  constructor(
    @InjectRepository(Holiday)
    private readonly holidayRepository: Repository<Holiday>,
  ) {}

  async getHoliday(month: number, year: number): Promise<any> {
    const result = await this.holidayRepository.find({
      where: {
        month: month,
        year: year,
      },
      order: {
        day: 'ASC',
      },
    });
    return result;
  }
}
