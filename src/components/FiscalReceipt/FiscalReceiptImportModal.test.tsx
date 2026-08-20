import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import FiscalReceiptImportModal from "./FiscalReceiptImportModal";
import { importFiscalReceiptFromUrl } from "../../services/fiscalReceipt/fiscalReceiptService";

const mockStop = jest.fn();
const mockDecode = jest.fn().mockResolvedValue({ stop: mockStop });

jest.mock("@zxing/browser", () => ({
    BrowserQRCodeReader: function () {
        return { decodeFromConstraints: (...args: unknown[]) => mockDecode(...args) };
    },
}));
jest.mock("../../services/fiscalReceipt/fiscalReceiptService", () => ({
    importFiscalReceiptFromUrl: jest.fn(),
    fiscalReceiptErrorMessage: jest.fn(() => "Falha ao importar"),
}));

const mockedImport = importFiscalReceiptFromUrl as jest.MockedFunction<typeof importFiscalReceiptFromUrl>;
const NFC_URL = "https://sat.sef.sc.gov.br/tax.NET/Sat.DFe.NFCe.Web/Consultas/NFCe_Detalhes.aspx?rq=token";
const importedReceipt = {
    id: 1, pantryId: 7, state: "NEEDS_REVIEW", issuerName: "Mercado teste",
    paidValue: 10, grossValue: 10, createdAt: "2026-08-19T12:00:00", items: [],
};

beforeEach(() => {
    jest.clearAllMocks();
    mockDecode.mockResolvedValue({ stop: mockStop });
});

test("imports a manually pasted URL for the current pantry", async () => {
    mockedImport.mockResolvedValue(importedReceipt);
    const onSuccess = jest.fn();
    render(<FiscalReceiptImportModal open pantryId={7} onClose={jest.fn()} onSuccess={onSuccess} />);

    fireEvent.click(screen.getByRole("button", { name: "Colar link" }));
    fireEvent.change(screen.getByLabelText("Link da NFC-e"), { target: { value: `  ${NFC_URL}  ` } });
    fireEvent.click(screen.getByRole("button", { name: "Importar nota" }));

    await waitFor(() => expect(mockedImport).toHaveBeenCalledWith(7, `  ${NFC_URL}  `));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
});

test("stops the camera after reading and waits for explicit confirmation", async () => {
    mockedImport.mockResolvedValue(importedReceipt);
    render(<FiscalReceiptImportModal open pantryId={7} onClose={jest.fn()} onSuccess={jest.fn()} />);
    await waitFor(() => expect(mockDecode).toHaveBeenCalled());
    const callback = mockDecode.mock.calls[0][2];

    act(() => callback({ getText: () => NFC_URL }));

    await waitFor(() => expect(screen.getByDisplayValue(NFC_URL)).toBeInTheDocument());
    await waitFor(() => expect(mockStop).toHaveBeenCalled());
    expect(mockedImport).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Importar nota" }));
    await waitFor(() => expect(mockedImport).toHaveBeenCalled());
});

test("shows a camera error and keeps the paste fallback available", async () => {
    mockDecode.mockRejectedValueOnce(new Error("permission denied"));
    render(<FiscalReceiptImportModal open pantryId={7} onClose={jest.fn()} onSuccess={jest.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível acessar a câmera");
    expect(screen.getByRole("button", { name: "Colar link" })).toBeEnabled();
});
