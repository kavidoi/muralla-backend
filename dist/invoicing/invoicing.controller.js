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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicingController = void 0;
const common_1 = require("@nestjs/common");
const invoicing_service_1 = require("./invoicing.service");
let InvoicingController = class InvoicingController {
    invoicingService;
    constructor(invoicingService) {
        this.invoicingService = invoicingService;
    }
    async getDocuments(page = '1', limit = '20') {
        return {
            documents: [],
            pagination: {
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                total: 0,
                totalPages: 0,
            },
        };
    }
    async getTaxDocuments(page = '1', limit = '20') {
        console.log('Controller method called, service is:', this.invoicingService);
        if (!this.invoicingService) {
            throw new Error('InvoicingService is not injected properly');
        }
        return this.invoicingService.getTaxDocuments(parseInt(page, 10), parseInt(limit, 10));
    }
    async getTaxDocumentStats() {
        return this.invoicingService.getTaxDocumentStats();
    }
    async getTaxDocumentById(id) {
        return this.invoicingService.getTaxDocumentById(id);
    }
};
exports.InvoicingController = InvoicingController;
__decorate([
    (0, common_1.Get)('documents'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InvoicingController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Get)('tax-documents'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InvoicingController.prototype, "getTaxDocuments", null);
__decorate([
    (0, common_1.Get)('tax-documents/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InvoicingController.prototype, "getTaxDocumentStats", null);
__decorate([
    (0, common_1.Get)('tax-documents/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoicingController.prototype, "getTaxDocumentById", null);
exports.InvoicingController = InvoicingController = __decorate([
    (0, common_1.Controller)('invoicing'),
    __metadata("design:paramtypes", [invoicing_service_1.InvoicingService])
], InvoicingController);
//# sourceMappingURL=invoicing.controller.js.map