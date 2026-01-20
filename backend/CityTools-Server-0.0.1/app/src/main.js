"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const dotenv = require("dotenv");
const os = require("os");
dotenv.config();
async function bootstrap() {
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule, {
            logger: ['error', 'warn', 'log'],
        });
        app.enableCors({
            origin: true,
            credentials: true,
        });
        app.useGlobalPipes(new common_1.ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }));
        app.setGlobalPrefix('api');
        const port = process.env.PORT || 3000;
        const host = process.env.HOST || '0.0.0.0';
        await app.listen(port, host);
        const networkInterfaces = os.networkInterfaces();
        const addresses = [];
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
        console.log('='.repeat(70));
        console.log('🚀 City Tools Server - Started Successfully!');
        console.log('='.repeat(70));
        console.log(`📍 Local:   http://localhost:${port}/api`);
        if (addresses.length > 0) {
            addresses.forEach(ip => {
                console.log(`📍 Network: http://${ip}:${port}/api`);
            });
        }
        else {
            console.log('⚠️  No network IP detected - check network connection');
        }
        console.log('='.repeat(70));
        console.log('✅ Server is ready to accept connections');
        console.log('📝 Environment:', process.env.NODE_ENV || 'development');
        console.log('🔄 Press Ctrl+C to stop the server');
        console.log('='.repeat(70));
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map