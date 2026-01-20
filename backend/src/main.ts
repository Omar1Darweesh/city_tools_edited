import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as os from 'os';

// Load environment variables
dotenv.config();

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    // Enable CORS for all local network IPs
    app.enableCors({
      origin: true,
      credentials: true,
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // API prefix
    app.setGlobalPrefix('api');

    const port = process.env.PORT || 3000;
    const host = process.env.HOST || '0.0.0.0'; // Listen on all network interfaces

    await app.listen(port, host);

    // Get local IP addresses
    const networkInterfaces = os.networkInterfaces();
    const addresses: string[] = [];

    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName];
      if (interfaces) {
        for (const iface of interfaces) {
          if (iface.family === 'IPv4' && !iface.internal) {
            addresses.push(iface.address);
          }
        }
      }
    }

    // Display startup information
    console.log('='.repeat(70));
    console.log('🚀 City Tools Server - Started Successfully!');
    console.log('='.repeat(70));
    console.log(`📍 Local:   http://localhost:${port}/api`);

    if (addresses.length > 0) {
      addresses.forEach(ip => {
        console.log(`📍 Network: http://${ip}:${port}/api`);
      });
    } else {
      console.log('⚠️  No network IP detected - check network connection');
    }

    console.log('='.repeat(70));
    console.log('✅ Server is ready to accept connections');
    console.log('📝 Environment:', process.env.NODE_ENV || 'development');
    console.log('🔄 Press Ctrl+C to stop the server');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
