import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { MigrationService } from './migration.service';

@Controller('migration')
export class MigrationController {
  constructor(private readonly migrationService: MigrationService) {}

  @Post()
  @HttpCode(200)
  async addUser(@Body() input: any): Promise<any> {
    // SECURITY: one-time import endpoint. Disabled by default — was wide-open,
    // no-auth. Set MIGRATION_ENABLED=true only for a controlled re-import, then
    // unset. Returns 404 so the route is not discoverable when disabled.
    if (process.env.MIGRATION_ENABLED !== 'true') {
      throw new NotFoundException();
    }
    const result = this.migrationService.addUser(input);
    return result;
  }
}
