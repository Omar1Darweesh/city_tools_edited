const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('='.repeat(70));
console.log('🏗️  City Tools - Production Build');
console.log('='.repeat(70));
console.log('');

// Step 1: Clean previous build
console.log('[1/5] 🧹 Cleaning previous build...');
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
    console.log('✅ Cleaned dist folder');
} else {
    console.log('✅ No previous build found');
}

// Step 2: Install dependencies
console.log('');
console.log('[2/5] 📦 Installing dependencies...');
try {
    execSync('npm install --production=false', { stdio: 'inherit' });
    console.log('✅ Dependencies installed');
} catch (error) {
    console.error('❌ Failed to install dependencies');
    process.exit(1);
}

// Step 3: Generate Prisma Client
console.log('');
console.log('[3/5] 🔄 Generating Prisma Client...');
try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma Client generated');
} catch (error) {
    console.error('❌ Failed to generate Prisma Client');
    process.exit(1);
}

// Step 4: Build NestJS application
console.log('');
console.log('[4/5] 🔨 Building NestJS application...');
try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Application built successfully');
} catch (error) {
    console.error('❌ Build failed');
    process.exit(1);
}

// Step 5: Copy necessary files
console.log('');
console.log('[5/5] 📋 Copying configuration files...');

// Copy package.json
const packageJson = require('../package.json');
const productionPackageJson = {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    scripts: {
        start: 'node main.js'
    },
    dependencies: packageJson.dependencies
};

fs.writeFileSync(
    path.join(distPath, 'package.json'),
    JSON.stringify(productionPackageJson, null, 2)
);
console.log('✅ Copied package.json');

// Copy prisma schema
const prismaDir = path.join(distPath, 'prisma');
if (!fs.existsSync(prismaDir)) {
    fs.mkdirSync(prismaDir, { recursive: true });
}

fs.copyFileSync(
    path.join(__dirname, '..', 'prisma', 'schema.prisma'),
    path.join(prismaDir, 'schema.prisma')
);
console.log('✅ Copied Prisma schema');

// Copy .env.example as .env.template
if (fs.existsSync(path.join(__dirname, '..', '.env.example'))) {
    fs.copyFileSync(
        path.join(__dirname, '..', '.env.example'),
        path.join(distPath, '.env.template')
    );
    console.log('✅ Copied .env template');
}

console.log('');
console.log('='.repeat(70));
console.log('✅ Production Build Complete!');
console.log('='.repeat(70));
console.log('');
console.log('📦 Build output: ' + distPath);
console.log('');
console.log('Next steps:');
console.log('  1. Test the build: cd dist && npm install --production && node main.js');
console.log('  2. Create installer package');
console.log('');
console.log('='.repeat(70));
