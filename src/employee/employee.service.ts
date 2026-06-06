import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MomentService } from 'src/utils/MomentService';
import { Employee } from './entity/employee-entity.model';
import { EmployeeCreateInput } from './dto/employee-create.input';
import * as bcrypt from 'bcrypt';
import { PASSWORD } from 'src/constants/password';
import { EmployeeAuthInput } from './dto/employee-auth.input';
@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private momentWrapper: MomentService,
  ) {}

  async createEmployee(_input: EmployeeCreateInput): Promise<any> {
    const createAt = this.momentWrapper.moment().format('YYYY-MM-DD HH:mm:ss');

    const userEntity = await this.employeeRepository.findOne({
      where: {
        username: _input.username,
      },
    });

    if (!userEntity) {
      const userNewEntity = new Employee();
      userNewEntity.create_at = createAt;
      userNewEntity.username = _input.username;
      const hashPassword = await bcrypt.hash(
        _input.password,
        PASSWORD.SALT_ROUND,
      );

      userNewEntity.password = hashPassword;
      const result = await this.employeeRepository.save(userNewEntity);
      return result;
    }

    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        error: 'มี ผู้ใช้งาน ในระบบแล้ว',
      },
      HttpStatus.BAD_REQUEST,
    );
  }

  async auth(_input: EmployeeAuthInput): Promise<any> {
    const userNewEntity = await this.employeeRepository.findOne({
      where: {
        username: _input.username,
      },
    });

    if (userNewEntity) {
      const isAuth = await bcrypt.compare(
        _input.password,
        userNewEntity.password,
      );
      if (isAuth) {
        return userNewEntity;
      }
    }
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        error: 'ไม่พบ ผู้ใช้งาน ในระบบ',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
