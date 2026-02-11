const Service = require('node-windows').Service;
const path = require('path');

// Path to your built application
const scriptPath = path.join(__dirname, '..', 'dist', 'main.js');

// Create a new service object
const svc = new Service({
    name: 'CityToolsServer',
    description: 'City Tools ERP/POS Backend Server - Runs the API server for all POS terminals',
    script: scriptPath,
    nodeOptions: [
        '--max_old_space_size=2048'
    ],
    env: [
        {
            name: 'NODE_ENV',
            value: 'production'
        }
    ],
    wait: 2,
    grow: 0.5,
    maxRestarts: 10
});

// Listen for the "install" event
svc.on('install', function () {
    console.log('✅ Service installed successfully!');
    console.log('🔄 Starting service...');
    svc.start();
});

svc.on('start', function () {
    console.log('');
    console.log('='.repeat(70));
    console.log('✅ City Tools Server Service Started!');
    console.log('='.repeat(70));
    console.log('');
    console.log('📋 Service Information:');
    console.log('   Name: CityToolsServer');
    console.log('   Status: Running');
    console.log('   Auto-start: Yes (on Windows boot)');
    console.log('');
    console.log('🔧 To manage this service:');
    console.log('   1. Open Services (Press Win+R, type: services.msc)');
    console.log('   2. Find "CityToolsServer" in the list');
    console.log('   3. Right-click to Stop/Start/Restart');
    console.log('');
    console.log('='.repeat(70));
    setTimeout(() => process.exit(0), 1000);
});

svc.on('alreadyinstalled', function () {
    console.log('⚠️  Service is already installed!');
    console.log('');
    console.log('To reinstall:');
    console.log('  1. Run: node scripts/uninstall-service.js');
    console.log('  2. Then run this script again');
    process.exit(1);
});

svc.on('error', function (err) {
    console.error('❌ Service installation failed!');
    console.error('Error:', err.message);
    console.error('');
    console.error('Make sure you run this script as Administrator');
    process.exit(1);
});

console.log('📦 Installing City Tools Server as Windows Service...');
console.log('⚠️  Administrator privileges required!');
console.log('');
svc.install();
