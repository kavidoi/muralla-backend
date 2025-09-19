import { InvoicingService } from './invoicing.service';
export declare class InvoicingController {
    private readonly invoicingService;
    constructor(invoicingService: InvoicingService);
    health(rut?: string): Promise<any>;
    list(type?: string, status?: string, startDate?: string, endDate?: string, search?: string, includeOpenFactura?: string, openFacturaOnly?: string, syncReceived?: string): Promise<any>;
    detail(id: string): Promise<any>;
    discoverEndpoints(): Promise<any>;
    listOpenFactura(startDate?: string, endDate?: string, type?: string, status?: string, search?: string): Promise<any>;
    costLinks(ids?: string): Promise<Record<string, {
        count: number;
        status: string;
        folio?: string;
    }>>;
    boletaFromPos(posTransactionId: string, body: {
        receiverRUT?: string;
        receiverName?: string;
        receiverEmail?: string;
        sendEmail?: boolean;
        emitNow?: boolean;
    }): Promise<any>;
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
    fetchReceivedDocuments(startDate?: string, endDate?: string, page?: string, tipoDocumento?: string, rutEmisor?: string, dateField?: string): Promise<any>;
    importReceivedDocuments(body?: {
        startDate?: string;
        endDate?: string;
        dryRun?: boolean;
    }): Promise<any>;
    acknowledgeReceivedDocument(folio: string, body: {
        rutEmisor: string;
        tipoDocumento: number;
        tipoAcuse: 'ACD' | 'RCD' | 'ERM' | 'RFP' | 'RFT';
    }): Promise<any>;
    getDocumentInFormat(id: string, format: string, display?: string, res: Response): Promise<any>;
    getDocumentPDF(id: string, display?: string, res: Response): Promise<any>;
    getDocumentPreview(id: string): Promise<{
        success: boolean;
        error: string;
        document?: undefined;
        availableFormats?: undefined;
        viewerRecommendation?: undefined;
    } | {
        success: boolean;
        document: {
            id: any;
            type: any;
            folio: any;
            emitterName: any;
            totalAmount: any;
        };
        availableFormats: any[];
        viewerRecommendation: string;
        error?: undefined;
    }>;
}
