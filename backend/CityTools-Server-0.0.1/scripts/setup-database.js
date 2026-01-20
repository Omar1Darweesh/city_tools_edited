const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function setupDatabase() {
    console.log('='.repeat(70));
    console.log('🗄️  City Tools - Database Setup Wizard');
    console.log('='.repeat(70));
    console.log('');

    console.log('Please enter your PostgreSQL database details:');
    console.log('(Press Enter to use default values shown in brackets)');
    console.log('');

    const dbHost = await question('Database Host [localhost]: ') || 'localhost';
    const dbPort = await question('Database Port [5432]: ') || '5432';
    const dbUser = await question('Database User [postgres]: ') || 'postgres';
    const dbPass = await question('Database Password [postgres]: ') || 'postgres';
    const dbName = await question('Database Name [city_tools]: ') || 'city_tools';

    if (!dbPass) {
        console.log('');
        console.log('❌ Error: Database password is required!');
        rl.close();
        process.exit(1);
    }

    const databaseUrl = `postgresql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?schema=public`;

    console.log('');
    console.log('📝 Creating .env file...');

    const envContent = `# Database Configuration
DATABASE_URL="${databaseUrl}"

# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# JWT Configuration
JWT_SECRET=${generateRandomString(64)}
JWT_EXPIRES_IN=24h

# Application Info
APP_NAME=City Tools System
APP_VERSION=1.0.0
`;

    const envPath = path.join(__dirname, '..', '.env');
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully');

    console.log('');
    console.log('🔄 Testing database connection...');

    try {
        // Test connection by running Prisma generate
        execSync('npx prisma generate', {
            stdio: 'inherit',
            env: { ...process.env, DATABASE_URL: databaseUrl }
        });
        console.log('✅ Database connection successful');

        console.log('');
        console.log('🔄 Running database migrations...');

        execSync('npx prisma migrate deploy', {
            stdio: 'inherit',
            env: { ...process.env, DATABASE_URL: databaseUrl }
        });
        console.log('✅ Database migrations completed');

        console.log('');
        const seedDb = await question('Do you want to seed initial data (create admin user, sample data)? (y/n): ');

        if (seedDb.toLowerCase() === 'y') {
            console.log('🔄 Seeding database...');
            execSync('npx prisma db seed', {
                stdio: 'inherit',
                env: { ...process.env, DATABASE_URL: databaseUrl }
            });
            console.log('✅ Database seeded successfully');
        }

        console.log('');
        console.log('='.repeat(70));
        console.log('✅ Database Setup Complete!');
        console.log('='.repeat(70));
        console.log('');
        console.log('📋 Database Information:');
        console.log(`   Host: ${dbHost}`);
        console.log(`   Port: ${dbPort}`);
        console.log(`   Database: ${dbName}`);
        console.log(`   User: ${dbUser}`);
        console.log('');
        console.log('🚀 You can now start the server with: npm run start:prod');
        console.log('='.repeat(70));

    } catch (error) {
        console.error('');
        console.error('❌ Database setup failed!');
        console.error('Error:', error.message);
        console.error('');
        console.error('Please check:');
        console.error('  1. PostgreSQL is installed and running');
        console.error('  2. Database credentials are correct');
        console.error('  3. Database user has permission to create databases');
        process.exit(1);
    }

    rl.close();
}

// Run the setup
setupDatabase().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
