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
    async health(rut) {
        return this.service.healthCheck(rut);
    }
    async list(type, status, startDate, endDate, search, includeOpenFactura, openFacturaOnly, syncReceived) {
        return this.service.listDocuments({
            type,
            status,
            startDate,
            endDate,
            search,
            includeOpenFactura: includeOpenFactura === undefined ? undefined : includeOpenFactura === 'true',
            openFacturaOnly: openFacturaOnly === 'true',
            syncReceived: syncReceived === undefined ? undefined : syncReceived === 'true',
        });
    }
    async detail(id) {
        return this.service.getDocument(id);
    }
    async discoverEndpoints() {
        return this.service.discoverWorkingEndpoints();
    }
    async listOpenFactura(startDate, endDate, type, status, search) {
        return this.service.listDocuments({
            type,
            status,
            startDate,
            endDate,
            search,
            includeOpenFactura: true,
            openFacturaOnly: true,
        });
    }
    async costLinks(ids) {
        const list = (ids || '').split(',').map(s => s.trim()).filter(Boolean);
        const links = await this.service.getCostLinks(list);
        const map = {};
        for (const d of links) {
            map[d.costId] = {
                count: (map[d.costId]?.count || 0) + 1,
                status: d.status,
                folio: d.folio,
            };
        }
        return map;
    }
    async boletaFromPos(posTransactionId, body) {
        console.log('Controller method called, service is:', this.invoicingService);
        if (!this.invoicingService) {
            throw new Error('InvoicingService is not injected properly');
        }
        return this.invoicingService.getTaxDocuments(page, limit);
    }
    async getTaxDocumentStats() {
        return this.invoicingService.getTaxDocumentStats();
    }
    async getTaxDocumentById(id) {
        return this.invoicingService.getTaxDocumentById(id);
    }
    async fetchReceivedDocuments(startDate, endDate, page, tipoDocumento, rutEmisor, dateField) {
        return this.service.fetchReceivedDocuments({
            startDate,
            endDate,
            page: page ? parseInt(page) : 1,
            tipoDocumento: tipoDocumento ? parseInt(tipoDocumento) : undefined,
            rutEmisor,
            dateField: dateField,
        });
    }
    async importReceivedDocuments(body = {}) {
        return this.service.importReceivedDocuments(body);
    }
    async acknowledgeReceivedDocument(folio, body) {
        return this.service.acknowledgeReceivedDocument(folio, body);
    }
    async getDocumentInFormat(id, format, display, res) {
        try {
            const validFormats = ['pdf', 'xml', 'json'];
            if (!validFormats.includes(format)) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid format. Supported formats: ${validFormats.join(', ')}`
                });
            }
            const documentData = await this.service.getDocumentInFormat(id, format);
            const displayMode = display === 'download' ? 'attachment' : 'inline';
            const headers = {
                'Content-Type': documentData.contentType,
            };
            let filename;
            switch (format) {
                case 'pdf':
                    filename = `document-${id}.pdf`;
                    break;
                case 'xml':
                    filename = `document-${id}.xml`;
                    break;
                case 'json':
                    filename = `document-${id}.json`;
                    break;
                default:
                    filename = `document-${id}.${format}`;
            }
            headers['Content-Disposition'] = `${displayMode}; filename="${filename}"`;
            if (format === 'pdf' && displayMode === 'inline') {
                headers['X-Frame-Options'] = 'SAMEORIGIN';
                headers['Content-Security-Policy'] = "frame-ancestors 'self'";
            }
            res.set(headers);
            res.send(documentData.data);
        }
        catch (error) {
            res.status(404).json({
                success: false,
                error: error.message
            });
        }
    }
    async getDocumentPDF(id, display, res) {
        return this.getDocumentInFormat(id, 'pdf', display, res);
    }
    async getDocumentPreview(id) {
        const document = await this.service.getDocument(id);
        if (!document) {
            return { success: false, error: 'Document not found' };
        }
        const availableFormats = [];
        try {
            await this.service.getDocumentPDF(id);
            availableFormats.push({
                format: 'pdf',
                url: `/invoicing/documents/${id}/pdf`,
                displayUrl: `/invoicing/documents/${id}/pdf?display=inline`,
                downloadUrl: `/invoicing/documents/${id}/pdf?display=download`,
                description: 'PDF Document'
            });
        }
        catch (error) {
        }
        try {
            await this.service.getDocumentXML(id);
            availableFormats.push({
                format: 'xml',
                url: `/invoicing/documents/${id}/xml`,
                displayUrl: `/invoicing/documents/${id}/xml?display=inline`,
                downloadUrl: `/invoicing/documents/${id}/xml?display=download`,
                description: 'XML Document'
            });
        }
        catch (error) {
        }
        availableFormats.push({
            format: 'json',
            url: `/invoicing/documents/${id}/json`,
            displayUrl: `/invoicing/documents/${id}/json?display=inline`,
            downloadUrl: `/invoicing/documents/${id}/json?display=download`,
            description: 'JSON Data'
        });
        return {
            success: true,
            document: {
                id: document.id,
                type: document.type,
                folio: document.folio,
                emitterName: document.emitterName || 'Unknown',
                totalAmount: document.totalAmount,
            },
            availableFormats,
            viewerRecommendation: availableFormats.find(f => f.format === 'pdf')
                ? 'PDF viewing recommended for best experience'
                : 'XML or JSON viewing available'
        };
    }
};
exports.InvoicingController = InvoicingController;
__decorate([
    Public(),
    (0, common_1.Get)('health'),
    __param(0, (0, common_1.Query)('rut')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoicingController.prototype, "health", null);
__decorate([
    (0, common_1.Get)('documents'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __param(4, (0, common_1.Query)('search')),
    __param(5, (0, common_1.Query)('includeOpenFactura')),
    __param(6, (0, common_1.Query)('openFacturaOnly')),
    __param(7, (0, common_1.Query)('syncReceived')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], InvoicingController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('documents/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoicingController.prototype, "detail", null);
__decorate([
    Public(),
    (0, common_1.Get)('discover-endpoints'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InvoicingController.prototype, "discoverEndpoints", null);
__decorate([
    Public(),
    (0, common_1.Get)('openfactura/documents'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('type')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], InvoicingController.prototype, "listOpenFactura", null);
__decorate([
    (0, common_1.Get)('links/cost'),
    __param(0, (0, common_1.Query)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoicingController.prototype, "costLinks", null);
__decorate([
    Post('boletas/from-pos/:posTransactionId'),
    __param(0, (0, common_1.Param)('posTransactionId')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvoicingController.prototype, "boletaFromPos", null);
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
__decorate([
    Public(),
    (0, common_1.Get)('received-documents'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('tipoDocumento')),
    __param(4, (0, common_1.Query)('rutEmisor')),
    __param(5, (0, common_1.Query)('dateField')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], InvoicingController.prototype, "fetchReceivedDocuments", null);
__decorate([
    Post('received-documents/import'),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvoicingController.prototype, "importReceivedDocuments", null);
__decorate([
    Post('received-documents/:folio/acknowledge'),
    __param(0, (0, common_1.Param)('folio')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvoicingController.prototype, "acknowledgeReceivedDocument", null);
__decorate([
    (0, common_1.Get)('documents/:id/:format'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('format')),
    __param(2, (0, common_1.Query)('display')),
    __param(3, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Response]),
    __metadata("design:returntype", Promise)
], InvoicingController.prototype, "getDocumentInFormat", null);
__decorate([
    (0, common_1.Get)('documents/:id/pdf'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('display')),
    __param(2, Res()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Response]),
    __metadata("design:returntype", Promise)
], InvoicingController.prototype, "getDocumentPDF", null);
__decorate([
    (0, common_1.Get)('documents/:id/preview'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoicingController.prototype, "getDocumentPreview", null);
exports.InvoicingController = InvoicingController = __decorate([
    (0, common_1.Controller)('invoicing'),
    __metadata("design:paramtypes", [invoicing_service_1.InvoicingService])
], InvoicingController);
//# sourceMappingURL=invoicing.controller.js.map