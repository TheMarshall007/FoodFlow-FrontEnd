import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import FiscalReceiptPendingList from "./FiscalReceiptPendingList";
import { deleteFiscalReceiptImport, fetchPendingFiscalReceipts } from "../../services/fiscalReceipt/fiscalReceiptService";

jest.mock("../../services/fiscalReceipt/fiscalReceiptService", () => ({
    fetchPendingFiscalReceipts: jest.fn(),
    deleteFiscalReceiptImport: jest.fn(),
    fiscalReceiptErrorMessage: jest.fn(() => "Falha na revisão"),
}));

const mockedFetch = fetchPendingFiscalReceipts as jest.MockedFunction<typeof fetchPendingFiscalReceipts>;
const mockedDelete = deleteFiscalReceiptImport as jest.MockedFunction<typeof deleteFiscalReceiptImport>;

const renderList = () => render(<MemoryRouter initialEntries={["/pantry/7/fiscal-receipts"]}>
    <Routes><Route path="/pantry/:pantryId/fiscal-receipts" element={<FiscalReceiptPendingList />} />
        <Route path="/pantry/:pantryId/fiscal-receipts/:importId" element={<p>Detalhe aberto</p>} /></Routes>
</MemoryRouter>);

beforeEach(() => jest.clearAllMocks());

test("shows pending progress and continues a saved review", async () => {
    mockedFetch.mockResolvedValue([{ id: 3, pantryId: 7, issuerName: "Mercado Teste", paidValue: 42.5,
        createdAt: "2026-08-19T12:00:00", totalItems: 4, resolvedItems: 2 }]);
    renderList();
    expect(await screen.findByText("Mercado Teste")).toBeInTheDocument();
    expect(screen.getByText(/2 de 4 produtos revisados/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Continuar revisão/i }));
    expect(await screen.findByText("Detalhe aberto")).toBeInTheDocument();
});

test("deletes a pending import after confirmation", async () => {
    mockedFetch.mockResolvedValue([{ id: 4, pantryId: 7, issuerName: "Mercado Teste", paidValue: 10,
        createdAt: "2026-08-19T12:00:00", totalItems: 1, resolvedItems: 0 }]);
    mockedDelete.mockResolvedValue();
    jest.spyOn(window, "confirm").mockReturnValue(true);
    renderList();
    fireEvent.click(await screen.findByRole("button", { name: "Excluir" }));
    await waitFor(() => expect(mockedDelete).toHaveBeenCalledWith(4));
    await waitFor(() => expect(screen.queryByText("Mercado Teste")).not.toBeInTheDocument());
});
