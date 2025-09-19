"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const helmet_1 = require("helmet");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    }));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    app.enableCors({
        origin: [
            'https://admin.murallacafe.cl',
            'https://muralla-frontend.onrender.com',
            'http://localhost:5173',
            'http://localhost:3000',
            process.env.FRONTEND_URL || 'https://admin.murallacafe.cl'
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    const port = process.env.PORT || 4000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Muralla backend running on port ${port}`);
    console.log(`🌐 CORS enabled for frontend origins`);
}
bootstrap();
//# sourceMappingURL=main.js.map