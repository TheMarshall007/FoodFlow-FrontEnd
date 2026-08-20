import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import FiscalReceiptReviewGuided from "./FiscalReceiptReviewGuided";
import { fetchFiscalReceiptImport, resolveFiscalReceiptItem } from "../../services/fiscalReceipt/fiscalReceiptService";

jest.mock("../../services/fiscalReceipt/fiscalReceiptService", () => ({
    fetchFiscalReceiptImport: jest.fn(), resolveFiscalReceiptItem: jest.fn(), confirmFiscalReceiptImport: jest.fn(),
    fiscalReceiptErrorMessage: jest.fn(() => "Falha na revisão"),
}));
jest.mock("../../services/product/productService", () => ({
    fetchProducts: jest.fn(),
    UnitOfMeasure: { GRAM: "g", KILOGRAM: "Kg", MILLILITER: "ml", LITER: "L", UNIT: "unit" },
}));

const mockedFetch = fetchFiscalReceiptImport as jest.MockedFunction<typeof fetchFiscalReceiptImport>;
const mockedResolve = resolveFiscalReceiptItem as jest.MockedFunction<typeof resolveFiscalReceiptItem>;
const receipt = {
    id: 9, pantryId: 7, state: "NEEDS_REVIEW", issuerName: "Mercado", paidValue: 5.99, grossValue: 5.99,
    createdAt: "2026-08-19T12:00:00", items: [{ id: 11, itemNumber: 1, description: "LEITE 1L", quantity: 1,
        commercialUnit: "UN", unitPrice: 5.99, totalPrice: 5.99, matchingStatus: "UNMATCHED" }],
};

const renderReview = () => render(<MemoryRouter initialEntries={["/pantry/7/fiscal-receipts/9"]}><Routes>
    <Route path="/pantry/:pantryId/fiscal-receipts/:importId" element={<FiscalReceiptReviewGuided />} />
</Routes></MemoryRouter>);

beforeEach(() => { jest.clearAllMocks(); mockedFetch.mockResolvedValue(receipt); mockedResolve.mockResolvedValue(receipt); });

test("guides package content and sends the calculated conversion contract", async () => {
    renderReview();
    fireEvent.click(await screen.findByRole("button", { name: /LEITE 1L/i }));
    fireEvent.click(screen.getByLabelText(/Criar produto temporário/i));
    fireEvent.change(screen.getByLabelText("Conteúdo de cada embalagem"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Unidade do conteúdo"), { target: { value: "L" } });
    expect(screen.getByText("Entrada na despensa: 1 L")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Salvar decisão" }));
    await waitFor(() => expect(mockedResolve).toHaveBeenCalledWith(9, 11, {
        resolutionAction: "CREATE_TEMPORARY_PRODUCT", productId: undefined,
        packageQuantity: 1, packageUnit: "L", stockQuantity: undefined, stockUnit: undefined,
    }));
});

test("opens the contextual guide with examples", async () => {
    renderReview();
    fireEvent.click(await screen.findByRole("button", { name: /Como preencher/i }));
    expect(screen.getByRole("dialog", { name: "Como informar as quantidades?" })).toBeInTheDocument();
    expect(screen.getByText("Ovos")).toBeInTheDocument();
    expect(screen.getByText("Carne por peso")).toBeInTheDocument();
});
