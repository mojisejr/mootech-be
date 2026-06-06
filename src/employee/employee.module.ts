import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MomentService } from 'src/utils/MomentService';
import { Employee } from './entity/employee-entity.model';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
@Module({
  imports: [TypeOrmModule.forFeature([Employee])],
  controllers: [EmployeeController],
  providers: [EmployeeService, MomentService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
