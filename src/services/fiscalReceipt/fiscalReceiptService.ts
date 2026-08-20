import { api } from "../api/apiConfig";
import { UnitOfMeasure } from "../product/productService";

export type FiscalResolutionAction = "USE_EXISTING_PRODUCT" | "CREATE_TEMPORARY_PRODUCT" | "EXPENSE_ONLY" | "IGNORE";
export type ReviewGroupStatus = "PENDING" | "PARTIAL" | "CONFLICT" | "SAVED";
export type ConversionRuleAction = "CURRENT_ONLY" | "UPDATE_LEARNED" | "USE_LEARNED";
export interface FiscalReceiptItem {
    id: number; itemNumber: number; gtin?: string; merchantProductCode?: string; description: string;
    quantity: number; commercialUnit: string; unitPrice: number; totalPrice: number;
    matchedProductId?: number; matchedProductName?: string; matchedProductBrand?: string;
    matchedProductQuantityPerUnit?: number; matchedProductUnit?: UnitOfMeasure;
    matchingStatus: string; resolutionAction?: FiscalResolutionAction;
    stockQuantity?: number; stockUnit?: UnitOfMeasure;
    packageQuantity?: number; packageUnit?: UnitOfMeasure;
    unitsPerCommercialUnit?: number; conversionRuleAction?: ConversionRuleAction;
}
export interface CommercialUnitGroup {
    commercialUnit: string; lineCount: number; totalQuantity: number; totalValue: number; directMeasurement: boolean;
    unitsPerCommercialUnit?: number; contentQuantityPerUnit?: number; contentUnit?: UnitOfMeasure;
    calculatedStockQuantity?: number; calculatedStockUnit?: UnitOfMeasure; learnedSuggestion?: boolean; lines: FiscalReceiptItem[];
}
export interface FiscalReviewGroup {
    reviewGroupId: string; description: string; gtin?: string; merchantProductCode?: string; identityType: string;
    identityWarning?: boolean; status: ReviewGroupStatus; lineCount: number; totalValue: number;
    resolutionAction?: FiscalResolutionAction; matchedProductId?: number; matchedProductName?: string; matchedProductBrand?: string;
    matchedProductQuantityPerUnit?: number; matchedProductUnit?: UnitOfMeasure; commercialUnitGroups: CommercialUnitGroup[];
}
export interface FiscalReceiptImportResponse {
    id: number; pantryId: number; state: string; issuerName: string; issuerCnpj?: string;
    purchaseDate?: string; paidValue: number; grossValue: number; discountValue?: number;
    createdAt: string; items: FiscalReceiptItem[]; reviewGroups?: FiscalReviewGroup[];
}
export interface PendingFiscalReceipt {
    id: number; pantryId: number; issuerName: string; purchaseDate?: string; paidValue: number;
    createdAt: string; totalItems: number; resolvedItems: number; totalReviewGroups?: number; resolvedReviewGroups?: number;
}
export interface ResolveReviewGroupRequest {
    resolutionAction: FiscalResolutionAction; productId?: number;
    conversions?: Array<{ commercialUnit: string; unitsPerCommercialUnit: number; contentQuantityPerUnit: number;
        contentUnit: UnitOfMeasure; ruleAction: ConversionRuleAction }>;
}
export interface ResolveFiscalItemRequest {
    resolutionAction: FiscalResolutionAction; productId?: number;
    stockQuantity?: number; stockUnit?: UnitOfMeasure;
    packageQuantity?: number; packageUnit?: UnitOfMeasure;
}
export async function importFiscalReceiptFromUrl(pantryId: number, url: string): Promise<FiscalReceiptImportResponse> {
    return (await api.post<FiscalReceiptImportResponse>("/fiscal-receipt-imports/from-url", { pantryId, url: url.trim() })).data;
}
export async function fetchPendingFiscalReceipts(pantryId: number): Promise<PendingFiscalReceipt[]> {
    return (await api.get<PendingFiscalReceipt[]>("/fiscal-receipt-imports/pending", { params: { pantryId } })).data;
}
export async function fetchFiscalReceiptImport(id: number): Promise<FiscalReceiptImportResponse> {
    return (await api.get<FiscalReceiptImportResponse>(`/fiscal-receipt-imports/${id}`)).data;
}
export async function resolveFiscalReceiptItem(importId: number, itemId: number, data: ResolveFiscalItemRequest): Promise<FiscalReceiptImportResponse> {
    return (await api.patch<FiscalReceiptImportResponse>(`/fiscal-receipt-imports/${importId}/items/${itemId}`, data)).data;
}
export async function resolveFiscalReviewGroup(importId: number, reviewGroupId: string, data: ResolveReviewGroupRequest): Promise<FiscalReceiptImportResponse> {
    return (await api.patch<FiscalReceiptImportResponse>(`/fiscal-receipt-imports/${importId}/review-groups/${reviewGroupId}`, data)).data;
}
export async function confirmFiscalReceiptImport(id: number): Promise<void> { await api.post(`/fiscal-receipt-imports/${id}/confirm`); }
export async function deleteFiscalReceiptImport(id: number): Promise<void> { await api.delete(`/fiscal-receipt-imports/${id}`); }
export function fiscalReceiptErrorMessage(error: unknown): string {
    const response = (error as { response?: { data?: { log?: string; message?: string; detail?: string } } })?.response;
    return response?.data?.log ?? response?.data?.message ?? response?.data?.detail ?? "Não foi possível concluir a operação.";
}
