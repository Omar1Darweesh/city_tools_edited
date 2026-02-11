import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execPromise = promisify(exec);

@Injectable()
export class DatabaseService {
    async createBackup(isManual: boolean = false) {
        // Use fixed filenames - one for manual, one for automatic
        const filename = isManual ? 'backup_manual.sql' : 'backup_automatic.sql';
        const backupsDir = path.join(process.cwd(), 'backups');
        const backupPath = path.join(backupsDir, filename);

        // Create backups folder if it doesn't exist
        if (!fs.existsSync(backupsDir)) {
            fs.mkdirSync(backupsDir, { recursive: true });
        }

        // Delete old backup file if it exists
        if (fs.existsSync(backupPath)) {
            fs.unlinkSync(backupPath);
        }

        // PostgreSQL backup command with full path
        const { PGUSER, PGHOST, PGDATABASE, PGPASSWORD } = process.env;

        const pgDumpPath = 'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe';
        const command = `"${pgDumpPath}" -U ${PGUSER} -h ${PGHOST} -d ${PGDATABASE} -f "${backupPath}"`;

        try {
            await execPromise(command, {
                env: { ...process.env, PGPASSWORD }
            });

            const stats = fs.statSync(backupPath);

            return {
                success: true,
                filename,
                type: isManual ? 'Manual' : 'Automatic',
                size: stats.size,
                path: backupPath,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            throw new Error(`Backup failed: ${error.message}`);
        }
    }
}
