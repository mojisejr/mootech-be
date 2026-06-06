import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeCreateInput } from './dto/employee-create.input';
import { EmployeeAuthInput } from './dto/employee-auth.input';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @HttpCode(200)
  async createEmployee(@Body() input: EmployeeCreateInput): Promise<any> {
    return await this.employeeService.createEmployee(input);
  }

  @Post('auth')
  @HttpCode(200)
  async auth(@Body() input: EmployeeAuthInput): Promise<any> {
    return await this.employeeService.auth(input);
  }
}
