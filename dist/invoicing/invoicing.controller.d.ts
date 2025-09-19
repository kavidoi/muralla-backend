import { InvoicingService } from './invoicing.service';
export declare class InvoicingController {
    private readonly invoicingService;
    constructor(invoicingService: InvoicingService);
    getDocuments(page?: string, limit?: string): Promise<{
        documents: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getTaxDocuments(page?: string, limit?: string): Promise<{
        documents: ({
            items: {
                id: string;
                taxDocumentId: string;
                productName: string;
                quantity: number;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                totalPrice: import("@prisma/client/runtime/library").Decimal;
                sku: string | null;
                category: string | null;
            }[];
        } & {
            id: string;
            type: import(".prisma/client").$Enums.TaxDocumentType;
            folio: string | null;
            documentCode: number | null;
            openFacturaId: string | null;
            emitterRUT: string | null;
            emitterName: string | null;
            receiverRUT: string | null;
            receiverName: string | null;
            netAmount: import("@prisma/client/runtime/library").Decimal | null;
            taxAmount: import("@prisma/client/runtime/library").Decimal | null;
            totalAmount: import("@prisma/client/runtime/library").Decimal | null;
            currency: string | null;
            issuedAt: Date | null;
            status: import(".prisma/client").$Enums.TaxDocumentStatus;
            pdfUrl: string | null;
            xmlUrl: string | null;
            rawResponse: import("@prisma/client/runtime/library").JsonValue | null;
            notes: string | null;
            posTransactionId: string | null;
            costId: string | null;
            tenantId: string | null;
            createdBy: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getTaxDocumentStats(): Promise<{
        total: number;
        totalAmount: number | import("@prisma/client/runtime/library").Decimal;
        recentTotal: number;
        byStatus: {};
        byType: {};
    }>;
    getTaxDocumentById(id: string): Promise<{
        items: {
            id: string;
            taxDocumentId: string;
            productName: string;
            quantity: number;
            unitPrice: import("@prisma/client/runtime/library").Decimal;
            totalPrice: import("@prisma/client/runtime/library").Decimal;
            sku: string | null;
            category: string | null;
        }[];
    } & {
        id: string;
        type: import(".prisma/client").$Enums.TaxDocumentType;
        folio: string | null;
        documentCode: number | null;
        openFacturaId: string | null;
        emitterRUT: string | null;
        emitterName: string | null;
        receiverRUT: string | null;
        receiverName: string | null;
        netAmount: import("@prisma/client/runtime/library").Decimal | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal | null;
        currency: string | null;
        issuedAt: Date | null;
        status: import(".prisma/client").$Enums.TaxDocumentStatus;
        pdfUrl: string | null;
        xmlUrl: string | null;
        rawResponse: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
        posTransactionId: string | null;
        costId: string | null;
        tenantId: string | null;
        createdBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
