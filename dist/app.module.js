"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = exports.AppBootstrapService = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const users_module_1 = require("./users/users.module");
const roles_module_1 = require("./roles/roles.module");
const auth_module_1 = require("./auth/auth.module");
const projects_module_1 = require("./projects/projects.module");
const tasks_module_1 = require("./tasks/tasks.module");
const health_module_1 = require("./health/health.module");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("./prisma/prisma.service");
const audit_service_1 = require("./common/audit.service");
const pagination_service_1 = require("./common/pagination.service");
const abilities_factory_1 = require("./common/abilities.factory");
const abilities_guard_1 = require("./common/abilities.guard");
const logger_module_1 = require("./common/logger.module");
const metrics_service_1 = require("./common/metrics.service");
const metrics_controller_1 = require("./common/metrics.controller");
const metrics_interceptor_1 = require("./common/metrics.interceptor");
const core_2 = require("@nestjs/core");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
const common_2 = require("@nestjs/common");
const users_service_1 = require("./users/users.service");
const https_redirect_middleware_1 = require("./common/https-redirect.middleware");
const config_1 = require("@nestjs/config");
const invoicing_module_1 = require("./invoicing/invoicing.module");
let AppBootstrapService = class AppBootstrapService {
    usersService;
    prisma;
    constructor(usersService, prisma) {
        this.usersService = usersService;
        this.prisma = prisma;
    }
    async onModuleInit() {
        console.log('🚀 Initializing application...');
        try {
            await this.prisma.$connect();
            console.log('✅ Database connected successfully');
        }
        catch (error) {
            console.error('❌ Database connection failed:', error.message);
        }
    }
};
exports.AppBootstrapService = AppBootstrapService;
exports.AppBootstrapService = AppBootstrapService = __decorate([
    (0, common_2.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof users_service_1.UsersService !== "undefined" && users_service_1.UsersService) === "function" ? _a : Object, prisma_service_1.PrismaService])
], AppBootstrapService);
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(https_redirect_middleware_1.HttpsRedirectMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 10,
                },
            ]),
            logger_module_1.CustomLoggerModule,
            users_module_1.UsersModule,
            roles_module_1.RolesModule,
            auth_module_1.AuthModule,
            projects_module_1.ProjectsModule,
            tasks_module_1.TasksModule,
            health_module_1.HealthModule,
            invoicing_module_1.InvoicingModule,
        ],
        controllers: [app_controller_1.AppController, metrics_controller_1.MetricsController],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: abilities_guard_1.AbilitiesGuard,
            },
            {
                provide: core_2.APP_INTERCEPTOR,
                useClass: metrics_interceptor_1.MetricsInterceptor,
            },
            prisma_service_1.PrismaService,
            audit_service_1.AuditService,
            pagination_service_1.PaginationService,
            abilities_factory_1.AbilityFactory,
            metrics_service_1.MetricsService,
            AppBootstrapService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map