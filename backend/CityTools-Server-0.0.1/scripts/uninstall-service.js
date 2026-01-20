const Service = require('node-windows').Service;
const path = require('path');

const svc = new Service({
    name: 'CityToolsServer',
    script: path.join(__dirname, '..', 'dist', 'main.js')
});

svc.on('uninstall', function () {
    console.log('✅ Service uninstalled successfully!');
    console.log('The server will no longer start automatically with Windows.');
    setTimeout(() => process.exit(0), 1000);
});

svc.on('error', function (err) {
    console.error('❌ Service uninstallation failed!');
    console.error('Error:', err.message);
    process.exit(1);
});

console.log('🗑️  Uninstalling City Tools Server service...');
console.log('');
svc.uninstall();
