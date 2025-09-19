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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let InvoicingService = class InvoicingService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTaxDocuments(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [documents, total] = await Promise.all([
            this.prisma.taxDocument.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    items: true,
                },
            }),
            this.prisma.taxDocument.count(),
        ]);
        return {
            documents,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getTaxDocumentById(id) {
        return this.prisma.taxDocument.findUnique({
            where: { id },
            include: {
                items: true,
            },
        });
    }
    async getTaxDocumentStats() {
        const [total, byStatus, byType, recentTotal] = await Promise.all([
            this.prisma.taxDocument.count(),
            this.prisma.taxDocument.groupBy({
                by: ['status'],
                _count: { status: true },
            }),
            this.prisma.taxDocument.groupBy({
                by: ['type'],
                _count: { type: true },
            }),
            this.prisma.taxDocument.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
        ]);
        const totalAmount = await this.prisma.taxDocument.aggregate({
            _sum: { totalAmount: true },
            where: { status: 'ISSUED' },
        });
        return {
            total,
            totalAmount: totalAmount._sum.totalAmount || 0,
            recentTotal,
            byStatus: byStatus.reduce((acc, item) => {
                acc[item.status] = item._count.status;
                return acc;
            }, {}),
            byType: byType.reduce((acc, item) => {
                acc[item.type] = item._count.type;
                return acc;
            }, {}),
        };
    }
};
exports.InvoicingService = InvoicingService;
exports.InvoicingService = InvoicingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoicingService);
//# sourceMappingURL=invoicing.service.js.map