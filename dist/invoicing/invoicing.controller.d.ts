import { InvoicingService } from './invoicing.service';
export declare class InvoicingController {
    private readonly invoicingService;
    constructor(invoicingService: InvoicingService);
    getTaxDocuments(page: number, limit: number): Promise<{
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
            tenantId: string | null;
            createdAt: Date;
            updatedAt: Date;
            id: string;
            status: import(".prisma/client").$Enums.TaxDocumentStatus;
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
            pdfUrl: string | null;
            xmlUrl: string | null;
            rawResponse: import("@prisma/client/runtime/library").JsonValue | null;
            notes: string | null;
            posTransactionId: string | null;
            costId: string | null;
            createdBy: string | null;
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
        tenantId: string | null;
        createdAt: Date;
        updatedAt: Date;
        id: string;
        status: import(".prisma/client").$Enums.TaxDocumentStatus;
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
        pdfUrl: string | null;
        xmlUrl: string | null;
        rawResponse: import("@prisma/client/runtime/library").JsonValue | null;
        notes: string | null;
        posTransactionId: string | null;
        costId: string | null;
        createdBy: string | null;
    }>;
}
