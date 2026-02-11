const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
require('dotenv').config();

const execAsync = promisify(exec);

// Configuration
const backupDir = path.join(__dirname, 'backups');
const dbBackupFile = path.join(backupDir, 'latest-database.dump');
const filesBackupFile = path.join(backupDir, 'latest-files.zip');
const logFile = path.join(backupDir, 'backup.log');

// PostgreSQL bin path (common locations on Windows)
const pgPaths = [
    'C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe',
    'C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe',
    'C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe',
    'C:\\Program Files\\PostgreSQL\\15\\bin\\pg_dump.exe',
    'C:\\Program Files\\PostgreSQL\\14\\bin\\pg_dump.exe',
    'C:\\Program Files (x86)\\PostgreSQL\\17\\bin\\pg_dump.exe',
    'C:\\Program Files (x86)\\PostgreSQL\\16\\bin\\pg_dump.exe',
    'C:\\Program Files (x86)\\PostgreSQL\\15\\bin\\pg_dump.exe',
    'pg_dump' // If it's in PATH
];

// Find pg_dump
function findPgDump() {
    for (const pgPath of pgPaths) {
        if (fs.existsSync(pgPath) || pgPath === 'pg_dump') {
            return pgPath;
        }
    }
    return null;
}

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

// Logging function
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(logFile, logMessage);
}

// Backup PostgreSQL database
async function backupDatabase() {
    const tempFile = `${dbBackupFile}.tmp`;

    // Find pg_dump executable
    const pgDumpPath = findPgDump();
    if (!pgDumpPath) {
        const error = 'pg_dump not found. Please install PostgreSQL or add it to PATH';
        log(`✗ ${error}`);
        return { success: false, error };
    }

    // Windows-compatible command
    const pgDumpCommand = `"${pgDumpPath}" -h ${process.env.PGHOST} -U ${process.env.PGUSER} -d ${process.env.PGDATABASE} -p ${process.env.PGPORT} -F c -f "${tempFile}"`;

    try {
        log('Starting database backup...');

        // Set environment variable for Windows
        const env = { ...process.env, PGPASSWORD: process.env.PGPASSWORD };

        await execAsync(pgDumpCommand, { env });

        // Verify backup file was created and has content
        if (!fs.existsSync(tempFile)) {
            throw new Error('Backup file was not created');
        }

        const fileSize = fs.statSync(tempFile).size;
        if (fileSize === 0) {
            throw new Error('Backup file is empty');
        }

        // Overwrite old backup with new one
        if (fs.existsSync(dbBackupFile)) {
            fs.unlinkSync(dbBackupFile);
        }
        fs.renameSync(tempFile, dbBackupFile);

        const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);
        log(`✓ Database backup completed: ${fileSizeMB} MB`);
        return { success: true, size: fileSizeMB };
    } catch (error) {
        log(`✗ Database backup failed: ${error.message}`);
        // Clean up temp file if it exists
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
        return { success: false, error: error.message };
    }
}

// Backup critical files
async function backupFiles() {
    const filesToBackup = [
        '.env',
        'prisma/schema.prisma',
        'prisma/migrations'
    ].filter(file => fs.existsSync(path.join(__dirname, file)));

    if (filesToBackup.length === 0) {
        log('No additional files to backup');
        return { success: true };
    }

    const tempFile = `${filesBackupFile}.tmp`;

    // Use PowerShell Compress-Archive for Windows (must be .zip)
    const filePaths = filesToBackup.map(f => path.join(__dirname, f));
    const zipCommand = `powershell Compress-Archive -Path "${filePaths.join('","')}" -DestinationPath "${tempFile.replace('.tmp', '')}" -Force`;

    try {
        log('Starting files backup...');

        // Remove old backup first
        if (fs.existsSync(filesBackupFile)) {
            fs.unlinkSync(filesBackupFile);
        }

        await execAsync(zipCommand);

        const fileSize = (fs.statSync(filesBackupFile).size / 1024 / 1024).toFixed(2);
        log(`✓ Files backup completed: ${fileSize} MB`);
        return { success: true, size: fileSize };
    } catch (error) {
        log(`✗ Files backup failed: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Main backup function
async function performBackup() {
    log('========================================');
    log('STARTING BACKUP');
    log('========================================');

    const dbResult = await backupDatabase();
    const filesResult = await backupFiles();

    if (dbResult.success && filesResult.success) {
        log('✓ ALL BACKUPS COMPLETED SUCCESSFULLY');
        return { success: true, dbSize: dbResult.size };
    } else {
        log('✗ BACKUP COMPLETED WITH ERRORS');
        return { success: false, error: dbResult.error || filesResult.error };
    }
}

// Export for use in other files
module.exports = { performBackup };

// Run if executed directly
if (require.main === module) {
    performBackup().then(result => {
        process.exit(result.success ? 0 : 1);
    });
}
