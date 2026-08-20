import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deleteFiscalReceiptImport, fetchPendingFiscalReceipts, fiscalReceiptErrorMessage, PendingFiscalReceipt } from "../../services/fiscalReceipt/fiscalReceiptService";
import "../../styles/pages/FiscalReceipt/FiscalReceiptReview.css";

const formatMoney = (value: number) => Number(value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const formatDate = (value?: string) => value ? new Date(value).toLocaleString("pt-BR") : "Data não informada";

const FiscalReceiptPendingList: React.FC = () => {
    const { pantryId: value } = useParams<{ pantryId: string }>();
    const pantryId = Number(value);
    const navigate = useNavigate();
    const [receipts, setReceipts] = useState<PendingFiscalReceipt[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = async () => {
        setLoading(true); setError("");
        try { setReceipts(await fetchPendingFiscalReceipts(pantryId)); }
        catch (requestError) { setError(fiscalReceiptErrorMessage(requestError)); }
        finally { setLoading(false); }
    };
    useEffect(() => { if (pantryId) load(); }, [pantryId]); // eslint-disable-line react-hooks/exhaustive-deps

    const remove = async (receipt: PendingFiscalReceipt) => {
        if (!window.confirm(`Excluir a importação de ${receipt.issuerName}?`)) return;
        try { await deleteFiscalReceiptImport(receipt.id); setReceipts(current => current.filter(item => item.id !== receipt.id)); }
        catch (requestError) { setError(fiscalReceiptErrorMessage(requestError)); }
    };

    return <main className="fiscal-page">
        <div className="fiscal-page-title"><div><h1>Revisões pendentes</h1><p>Notas importadas para esta despensa.</p></div>
            <button className="fiscal-secondary" onClick={() => navigate(`/pantry/${pantryId}`)}>Voltar à despensa</button></div>
        {error && <div className="fiscal-alert" role="alert">{error}</div>}
        {loading ? <p>Carregando revisões...</p> : receipts.length === 0 ?
            <div className="fiscal-empty"><h2>Nenhuma revisão pendente</h2><p>As próximas NFC-e importadas aparecerão aqui.</p></div> :
            <div className="receipt-grid">{receipts.map(receipt => {
                const total = receipt.totalReviewGroups ?? receipt.totalItems;
                const resolved = receipt.resolvedReviewGroups ?? receipt.resolvedItems;
                const started = resolved > 0;
                return <article className="receipt-card" key={receipt.id}>
                    <div><span className="fiscal-kicker">NFC-e #{receipt.id}</span><h2>{receipt.issuerName || "Emitente não informado"}</h2>
                        <p>{formatDate(receipt.purchaseDate || receipt.createdAt)}</p></div>
                    <strong>{formatMoney(receipt.paidValue)}</strong>
                    <div className="fiscal-progress"><span style={{ width: `${total ? resolved * 100 / total : 0}%` }} /></div>
                    <p>{resolved} de {total} produtos revisados <small>({receipt.resolvedItems} de {receipt.totalItems} lançamentos)</small></p>
                    <div className="receipt-actions"><button className="fiscal-primary" onClick={() => navigate(`/pantry/${pantryId}/fiscal-receipts/${receipt.id}`)}>
                        {started ? "Continuar revisão" : "Iniciar revisão"}</button>
                        <button className="fiscal-danger-link" onClick={() => remove(receipt)}>Excluir</button></div>
                </article>;
            })}</div>}
    </main>;
};
export default FiscalReceiptPendingList;
