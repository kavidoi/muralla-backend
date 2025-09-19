import { PrismaService } from '../prisma/prisma.service';
export declare class InvoicingService {
    private prisma;
    constructor(prisma: PrismaService);
    getTaxDocuments(page?: number, limit?: number): Promise<any>;
    private normalizeOpenFacturaDocuments;
    private mapDocumentType;
    private getDocumentTypeName;
    private getPaymentMethodDescription;
    private getPurchaseTypeDescription;
    private getAcknowledgmentDescription;
    discoverWorkingEndpoints(): Promise<{
        companyRut: string;
        totalEndpointsTested: number;
        successfulEndpoints: number;
        workingEndpoint: any;
        documentCount: any;
        sampleDocument: any;
        allResults: {
            endpoint: any;
            success: any;
            status: any;
            documentCount: any;
            error: any;
        }[];
        recommendation: string;
    }>;
    getDocument(id: string): Promise<any>;
    getCostLinks(costIds: string[]): Promise<any>;
    issueBoletaFromPos(posTransactionId: string, opts?: {
        receiverRUT?: string;
        receiverName?: string;
        sendEmail?: boolean;
        emitNow?: boolean;
    }): Promise<{
        enviarPorEmail: boolean;
        generarPdf: boolean;
        generarXml: boolean;
        emailReceptor: any;
        nombreReceptor: any;
        codigoTipoDocumento: number;
        rutEmisor: string;
        rutReceptor: any;
        fechaEmision: string;
        indicadorFacturacionExenta: number;
        montoNeto: number;
        montoIva: number;
        montoTotal: number;
        detalle: any;
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
        type: import("@prisma/client").$Enums.TaxDocumentType;
        status: import("@prisma/client").$Enums.TaxDocumentStatus;
        folio: string | null;
        emitterRUT: string | null;
        emitterName: string | null;
        receiverRUT: string | null;
        receiverName: string | null;
        netAmount: import("@prisma/client/runtime/library").Decimal | null;
        taxAmount: import("@prisma/client/runtime/library").Decimal | null;
        totalAmount: import("@prisma/client/runtime/library").Decimal | null;
        id: string;
        documentCode: number | null;
        openFacturaId: string | null;
        currency: string | null;
        issuedAt: Date | null;
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
    getTaxDocumentStats(): Promise<{
        enviarPorEmail: boolean;
        generarPdf: boolean;
        generarXml: boolean;
        emailReceptor: any;
        codigoTipoDocumento: number;
        rutEmisor: string;
        rutReceptor: any;
        fechaEmision: string;
        indicadorFacturacionExenta: number;
        montoNeto: number;
        montoIva: number;
        montoTotal: number;
        detalle: any;
        nombreReceptor: any;
    }>;
    fetchReceivedDocuments(params?: {
        startDate?: string;
        endDate?: string;
        page?: number;
        tipoDocumento?: number;
        rutEmisor?: string;
        dateField?: 'FchEmis' | 'FchRecepOF' | 'FchRecepSII';
    }): Promise<{
        currentPage: any;
        lastPage: any;
        total: any;
        documents: any;
    }>;
    syncReceivedDocuments(): Promise<{
        totalFetched: number;
        totalImported: number;
        totalSkipped: number;
        errors: any[];
        imported: any[];
    }>;
    importReceivedDocuments(params?: {
        startDate?: string;
        endDate?: string;
        dryRun?: boolean;
    }): Promise<{
        totalFetched: number;
        totalImported: number;
        totalSkipped: number;
        errors: any[];
        imported: any[];
    }>;
    acknowledgeReceivedDocument(folio: string, params: {
        rutEmisor: string;
        tipoDocumento: number;
        tipoAcuse: 'ACD' | 'RCD' | 'ERM' | 'RFP' | 'RFT';
    }): Promise<{
        success: boolean;
        acknowledgment: {
            folio: number;
            rutEmisor: string;
            tipoDocumento: number;
            tipoAcuse: "ACD" | "RCD" | "ERM" | "RFP" | "RFT";
            descripcion: string;
        };
        openFacturaResponse: any;
    }>;
    getDocumentPDF(id: string): Promise<{
        data: any;
        headers: any;
        contentType: string;
        source: string;
    } | {
        data: any;
        headers: any;
        contentType: string;
    }>;
    fetchPDFFromOpenFactura(params: {
        rutEmisor: string;
        folio: string;
        tipoDocumento: number;
        isReceived?: boolean;
    }): Promise<{
        data: any;
        headers: any;
        contentType: string;
        source: string;
    }>;
    getDocumentInFormat(id: string, format: 'pdf' | 'xml' | 'json'): Promise<{
        data: any;
        headers: any;
        contentType: string;
    }>;
    getDocumentXML(id: string): Promise<{
        data: any;
        headers: any;
        contentType: string;
        source?: undefined;
    } | {
        data: any;
        headers: any;
        contentType: string;
        source: string;
    }>;
}
