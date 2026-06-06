import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { MigrationService } from './migration.service';

@Controller('migration')
export class MigrationController {
  constructor(private readonly migrationService: MigrationService) {}

  @Post()
  @HttpCode(200)
  async addUser(@Body() input: any): Promise<any> {
    const result = this.migrationService.addUser(input);
    return result;
  }
}
