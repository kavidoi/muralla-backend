"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_full_1 = require("./app.module.full");
const helmet_1 = require("helmet");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const fs_1 = require("fs");
const express = require("express");
async function bootstrap() {
    const createAppPromise = core_1.NestFactory.create(app_module_full_1.AppModule);
    const appTimeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Application startup timeout')), 30000));
    let app;
    try {
        app = await Promise.race([createAppPromise, appTimeoutPromise]);
        console.log('✅ NestJS application created successfully');
    }
    catch (error) {
        console.error('❌ Application startup failed:', error.message);
        process.exit(1);
    }
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.set('trust proxy', 1);
    expressApp.use((req, _res, next) => {
        if (req.path && req.path.startsWith('/health')) {
            console.log(`[HEALTH-REQ] ${req.method} ${req.path} host=${req.headers?.host || ''} xfwd-proto=${req.headers?.['x-forwarded-proto'] || ''}`);
        }
        next();
    });
    expressApp.get('/health/healthz', (_req, res) => {
        console.log('[HEALTH-EXPRESS] GET /health/healthz');
        res.status(200).json({ status: 'up', timestamp: new Date().toISOString(), source: 'express' });
    });
    expressApp.head('/health/healthz', (_req, res) => {
        console.log('[HEALTH-EXPRESS] HEAD /health/healthz');
        res.sendStatus(200);
    });
    expressApp.get('/health', (_req, res) => {
        console.log('[HEALTH-EXPRESS] GET /health');
        res.status(200).json({ status: 'up', timestamp: new Date().toISOString(), source: 'express' });
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: false,
    }));
    const isProd = process.env.NODE_ENV === 'production';
    const connectSrcDirectives = isProd
        ? ["'self'", 'https:', 'wss:']
        : ["'self'", 'http:', 'https:', 'ws:', 'wss:'];
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'", 'https://sdk.mercadopago.com'],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: connectSrcDirectives,
                fontSrc: ["'self'", 'https:', 'data:'],
                mediaSrc: ["'self'", 'https:'],
                objectSrc: ["'none'"],
                baseSrc: ["'self'"],
                frameSrc: ["'self'", 'https://www.mercadopago.com', 'https://www.mercadopago.cl'],
            },
        },
        crossOriginEmbedderPolicy: false,
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        },
        frameguard: { action: 'deny' },
        noSniff: true,
        xssFilter: true,
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    }));
    const frontendUrl = process.env.FRONTEND_URL;
    const allowedOrigins = [
        ...(frontendUrl ? [frontendUrl] : []),
        ...(isProd ? [] : ['http://localhost:5173', 'https://localhost:5173', 'http://localhost:3000', 'https://localhost:3000', 'http://localhost:4000', 'http://172.20.0.3:5173', 'http://172.20.0.3:5174']),
        'https://admin.murallacafe.cl',
        ...(process.env.RENDER_EXTERNAL_URL ? [process.env.RENDER_EXTERNAL_URL] : []),
    ];
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.includes(origin))
                return callback(null, true);
            if (isProd && origin && !origin.startsWith('https://')) {
                console.warn(`[CORS] Blocked non-HTTPS origin in production: ${origin}`);
                return callback(new Error('HTTPS required in production'), false);
            }
            if (!isProd && origin && origin.startsWith('http://localhost')) {
                console.warn(`[CORS] Allowing localhost origin in development: ${origin}`);
                return callback(null, true);
            }
            console.warn(`[CORS] Blocked origin: ${origin}`);
            return callback(new Error('Not allowed by CORS'), false);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
        exposedHeaders: ['X-Total-Count'],
    });
    const uploadsDir = (0, path_1.join)(process.cwd(), 'uploads');
    if (!(0, fs_1.existsSync)(uploadsDir)) {
        (0, fs_1.mkdirSync)(uploadsDir, { recursive: true });
    }
    expressApp.use('/uploads', express.static(uploadsDir));
    const port = process.env.PORT || 4000;
    console.log(`[BOOT] process.env.PORT=${process.env.PORT} | binding port=${port}`);
    await app.listen(port, '0.0.0.0');
    const protocol = isProd ? 'https' : 'http';
    const externalUrl = process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL || `${protocol}://localhost:${port}`;
    console.log(`🚀 Muralla backend running on ${externalUrl}`);
    console.log(`🔒 SSL/TLS: ${isProd ? 'Enabled (reverse proxy)' : 'Development mode'}`);
    console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
}
bootstrap();
//# sourceMappingURL=main.js.map