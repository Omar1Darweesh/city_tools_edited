const cron = require('node-cron');
const { performBackup } = require('./backup');

// Run at 8:45 PM for testing
cron.schedule('45 20 * * *', async () => {
    console.log(`[${new Date().toISOString()}] Starting scheduled backup...`);

    const result = await performBackup();

    if (result.success) {
        console.log('✓ Scheduled backup completed successfully');
    } else {
        console.error('✗ Scheduled backup failed:', result.error);
    }
});

console.log('========================================');
console.log('🕒 Backup Scheduler Started');
console.log('📅 Daily backups at 8:45 PM (TESTING)');
console.log('📁 Location: ./backups/');
console.log('========================================\n');

// Keep the process alive
process.on('SIGINT', () => {
    console.log('\n🛑 Backup scheduler stopped');
    process.exit(0);
});
