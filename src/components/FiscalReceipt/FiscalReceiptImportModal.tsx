import React, { useCallback, useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { fiscalReceiptErrorMessage, importFiscalReceiptFromUrl } from "../../services/fiscalReceipt/fiscalReceiptService";
import "../../styles/components/FiscalReceipt/FiscalReceiptImportModal.css";

interface Props { open: boolean; pantryId: number; onClose: () => void; onSuccess: () => void; }
type Mode = "camera" | "paste";

const FiscalReceiptImportModal: React.FC<Props> = ({ open, pantryId, onClose, onSuccess }) => {
    const [mode, setMode] = useState<Mode>("camera");
    const [url, setUrl] = useState("");
    const [scanning, setScanning] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const videoRef = useRef<HTMLVideoElement>(null);
    const controlsRef = useRef<IScannerControls | null>(null);

    const stopCamera = useCallback(() => {
        controlsRef.current?.stop();
        controlsRef.current = null;
        const stream = videoRef.current?.srcObject;
        if (typeof MediaStream !== "undefined" && stream instanceof MediaStream)
            stream.getTracks().forEach(track => track.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
        setScanning(false);
    }, []);

    useEffect(() => {
        if (!open || mode !== "camera" || url) return;
        let cancelled = false;
        setError(""); setScanning(true);
        const reader = new BrowserQRCodeReader();
        reader.decodeFromConstraints({ video: { facingMode: { ideal: "environment" } } }, videoRef.current!, result => {
            if (!result || cancelled) return;
            setUrl(result.getText()); stopCamera();
        }).then(controls => {
            if (cancelled) controls.stop(); else controlsRef.current = controls;
        }).catch(() => {
            if (!cancelled) { setScanning(false); setError("Não foi possível acessar a câmera. Permita o acesso ou cole o link da NFC-e."); }
        });
        return () => { cancelled = true; stopCamera(); };
    }, [mode, open, stopCamera, url]);

    useEffect(() => () => stopCamera(), [stopCamera]);
    if (!open) return null;

    const changeMode = (nextMode: Mode) => {
        stopCamera(); setMode(nextMode); setError("");
        if (nextMode === "camera") setUrl("");
    };
    const close = () => {
        stopCamera(); setUrl(""); setError(""); setMode("camera"); onClose();
    };
    const submit = async () => {
        if (!url.trim()) { setError("Leia o QR Code ou informe o link da NFC-e."); return; }
        setSubmitting(true); setError("");
        try { await importFiscalReceiptFromUrl(pantryId, url); close(); onSuccess(); }
        catch (requestError) { setError(fiscalReceiptErrorMessage(requestError)); }
        finally { setSubmitting(false); }
    };

    return <div className="nfce-modal-backdrop" role="presentation">
        <section className="nfce-modal" role="dialog" aria-modal="true" aria-labelledby="nfce-title">
            <div className="nfce-modal-header"><h2 id="nfce-title">Importar NFC-e</h2>
                <button type="button" className="nfce-close" aria-label="Fechar" onClick={close}>×</button></div>
            <div className="nfce-mode-tabs">
                <button className={mode === "camera" ? "active" : ""} onClick={() => changeMode("camera")}>Ler QR Code</button>
                <button className={mode === "paste" ? "active" : ""} onClick={() => changeMode("paste")}>Colar link</button>
            </div>
            {mode === "camera" && !url && <div className="nfce-camera">
                <video ref={videoRef} muted playsInline aria-label="Câmera para leitura do QR Code" />
                <p>{scanning ? "Aponte a câmera para o QR Code da nota." : "Preparando câmera..."}</p></div>}
            {(mode === "paste" || url) && <div className="nfce-url-field">
                <label htmlFor="nfce-url">Link da NFC-e</label>
                <textarea id="nfce-url" value={url} onChange={event => setUrl(event.target.value)}
                    placeholder="https://sat.sef.sc.gov.br/..." rows={4} disabled={submitting} />
                {mode === "camera" && url && <p>QR Code lido. Confirme para importar esta nota.</p>}
            </div>}
            {error && <div className="nfce-error" role="alert">{error}</div>}
            <div className="nfce-actions">
                <button type="button" className="nfce-secondary" onClick={close} disabled={submitting}>Cancelar</button>
                <button type="button" className="nfce-primary" onClick={submit} disabled={submitting || !url.trim()}>
                    {submitting ? "Consultando nota..." : "Importar nota"}</button>
            </div>
        </section>
    </div>;
};

export default FiscalReceiptImportModal;
