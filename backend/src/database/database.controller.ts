import { Controller, Post } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller('database')
export class DatabaseController {
    constructor(private readonly databaseService: DatabaseService) { }

    @Post('backup')
    async createBackup() {
        // Pass true for manual backup
        return this.databaseService.createBackup(true);
    }
}
