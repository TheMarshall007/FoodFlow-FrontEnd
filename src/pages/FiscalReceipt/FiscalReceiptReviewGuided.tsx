import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductDTOResponse, UnitOfMeasure, fetchProducts } from "../../services/product/productService";
import { confirmFiscalReceiptImport, fetchFiscalReceiptImport, fiscalReceiptErrorMessage, FiscalReceiptImportResponse, FiscalReceiptItem, FiscalResolutionAction, resolveFiscalReceiptItem } from "../../services/fiscalReceipt/fiscalReceiptService";
import FiscalQuantityHelpModal from "./FiscalQuantityHelpModal";
import "../../styles/pages/FiscalReceipt/FiscalReceiptReview.css";

const units = Object.values(UnitOfMeasure);
const directUnits = ["KG", "G", "L", "ML"];
const money = (value: number) => Number(value ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const decimal = (value: number) => Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 3 });
const isStockAction = (action?: FiscalResolutionAction | "") => action === "USE_EXISTING_PRODUCT" || action === "CREATE_TEMPORARY_PRODUCT";
type SelectedProduct = Pick<ProductDTOResponse, "id" | "name" | "brand" | "gtin" | "quantityPerUnit" | "unit">;

function isDirect(item: FiscalReceiptItem) { return directUnits.includes(item.commercialUnit.trim().toUpperCase()); }
function hasKnownConversion(item: FiscalReceiptItem) { return item.resolutionAction === "USE_EXISTING_PRODUCT" && !!item.matchedProductQuantityPerUnit && !!item.matchedProductUnit; }
function isReady(item: FiscalReceiptItem): boolean {
    if (!item.resolutionAction) return false;
    if (!isStockAction(item.resolutionAction) || isDirect(item)) return true;
    return hasKnownConversion(item) || (!!item.packageQuantity && !!item.packageUnit) || (!!item.stockQuantity && !!item.stockUnit);
}

interface EditorProps { importId: number; item: FiscalReceiptItem; onSaved: (value: FiscalReceiptImportResponse) => void; onCancel: () => void; onHelp: () => void; }
const FiscalItemEditor: React.FC<EditorProps> = ({ importId, item, onSaved, onCancel, onHelp }) => {
    const [action, setAction] = useState<FiscalResolutionAction | "">(item.resolutionAction || "");
    const [selected, setSelected] = useState<SelectedProduct | null>(item.matchedProductId ? {
        id: item.matchedProductId, name: item.matchedProductName || "Produto selecionado", brand: item.matchedProductBrand || "",
        gtin: item.gtin || "", quantityPerUnit: item.matchedProductQuantityPerUnit || 0, unit: item.matchedProductUnit as UnitOfMeasure,
    } : null);
    const [name, setName] = useState(""); const [gtin, setGtin] = useState("");
    const [results, setResults] = useState<ProductDTOResponse[]>([]); const [searching, setSearching] = useState(false);
    const [packageQuantity, setPackageQuantity] = useState(item.packageQuantity?.toString() || "");
    const [packageUnit, setPackageUnit] = useState<UnitOfMeasure | "">(item.packageUnit || "");
    const [manualOverride, setManualOverride] = useState(!!item.stockQuantity && !item.packageQuantity);
    const [stockQuantity, setStockQuantity] = useState(item.stockQuantity?.toString() || "");
    const [stockUnit, setStockUnit] = useState<UnitOfMeasure | "">(item.stockUnit || "");
    const [saving, setSaving] = useState(false); const [error, setError] = useState("");
    const direct = isDirect(item);
    const knownConversion = action === "USE_EXISTING_PRODUCT" && !!selected?.quantityPerUnit && !!selected?.unit;
    const asksPackage = isStockAction(action) && !direct && !knownConversion && !manualOverride;
    const calculatedTotal = packageQuantity ? item.quantity * Number(packageQuantity) : 0;
    const knownTotal = knownConversion ? item.quantity * Number(selected?.quantityPerUnit) : 0;

    const chooseAction = (next: FiscalResolutionAction) => {
        setAction(next); setError("");
        if (!isStockAction(next)) { setPackageQuantity(""); setPackageUnit(""); setStockQuantity(""); setStockUnit(""); setManualOverride(false); }
    };
    const search = async () => {
        setSearching(true); setError("");
        try { setResults((await fetchProducts({ page: 0, name: name.trim() || undefined, gtin: gtin.trim() || undefined })).content); }
        catch (requestError) { setError(fiscalReceiptErrorMessage(requestError)); }
        finally { setSearching(false); }
    };
    const save = async () => {
        if (!action) { setError("Escolha uma decisão para este item."); return; }
        if (action === "USE_EXISTING_PRODUCT" && !selected) { setError("Selecione um produto existente."); return; }
        if (asksPackage && (!packageQuantity || !packageUnit || Number(packageQuantity) <= 0)) { setError("Informe quanto existe dentro de cada embalagem."); return; }
        if (manualOverride && (!stockQuantity || !stockUnit || Number(stockQuantity) <= 0)) { setError("Informe a entrada total desta compra."); return; }
        setSaving(true); setError("");
        try { onSaved(await resolveFiscalReceiptItem(importId, item.id, {
            resolutionAction: action, productId: action === "USE_EXISTING_PRODUCT" ? selected?.id : undefined,
            packageQuantity: asksPackage ? Number(packageQuantity) : undefined, packageUnit: asksPackage ? packageUnit || undefined : undefined,
            stockQuantity: manualOverride ? Number(stockQuantity) : undefined, stockUnit: manualOverride ? stockUnit || undefined : undefined,
        })); } catch (requestError) { setError(fiscalReceiptErrorMessage(requestError)); }
        finally { setSaving(false); }
    };

    return <div className="fiscal-editor">
        {item.matchedProductId && <div className="fiscal-suggestion"><span>Produto sugerido</span><strong>{item.matchedProductName}</strong>
            <button onClick={() => { setAction("USE_EXISTING_PRODUCT"); setSelected({ id: item.matchedProductId!, name: item.matchedProductName || "Produto sugerido", brand: item.matchedProductBrand || "", gtin: item.gtin || "", quantityPerUnit: item.matchedProductQuantityPerUnit || 0, unit: item.matchedProductUnit as UnitOfMeasure }); }}>Usar sugestão</button></div>}
        <fieldset className="fiscal-decisions"><legend>O que fazer com este item?</legend>
            <label><input type="radio" checked={action === "USE_EXISTING_PRODUCT"} onChange={() => chooseAction("USE_EXISTING_PRODUCT")} /> Usar produto existente</label>
            <label><input type="radio" checked={action === "CREATE_TEMPORARY_PRODUCT"} onChange={() => chooseAction("CREATE_TEMPORARY_PRODUCT")} /> Criar produto temporário</label>
            <label><input type="radio" checked={action === "EXPENSE_ONLY"} onChange={() => chooseAction("EXPENSE_ONLY")} /> Somente despesa</label>
            <label><input type="radio" checked={action === "IGNORE"} onChange={() => chooseAction("IGNORE")} /> Ignorar</label>
        </fieldset>
        {action === "USE_EXISTING_PRODUCT" && <div className="product-picker">
            {selected && <p className="selected-product">Selecionado: <strong>{selected.name}</strong> {selected.brand}</p>}
            <div className="product-search"><input aria-label="Buscar produto por nome" placeholder="Nome do produto" value={name} onChange={e => setName(e.target.value)} />
                <input aria-label="Buscar produto por GTIN" placeholder="GTIN exato" value={gtin} onChange={e => setGtin(e.target.value)} />
                <button onClick={search} disabled={searching}>{searching ? "Buscando..." : "Buscar"}</button></div>
            {results.length > 0 && <div className="product-results">{results.map(product => <button key={product.id} onClick={() => { setSelected(product); setManualOverride(false); }}>
                <strong>{product.name}</strong><span>{product.brand} {product.gtin ? `• ${product.gtin}` : ""}</span></button>)}</div>}
        </div>}
        {isStockAction(action) && <section className="guided-quantity">
            <div className="guided-quantity-title"><div><strong>Quanto entra na despensa?</strong><p>A nota registra {decimal(item.quantity)} {item.commercialUnit}.</p></div>
                <button type="button" className="quantity-help-button" onClick={onHelp}>? Como preencher?</button></div>
            {direct && <div className="quantity-result"><span>Conversão automática</span><strong>Entrada: {decimal(item.quantity)} {item.commercialUnit}</strong><small>Este item já foi vendido diretamente por peso ou volume.</small></div>}
            {!direct && knownConversion && !manualOverride && <div className="quantity-result"><span>Conversão do produto cadastrado</span>
                <strong>{decimal(item.quantity)} embalagens × {decimal(Number(selected?.quantityPerUnit))} {selected?.unit} = {decimal(knownTotal)} {selected?.unit}</strong>
                <button type="button" className="quantity-correction" onClick={() => { setManualOverride(true); setStockQuantity(knownTotal.toString()); setStockUnit(selected?.unit || ""); }}>Corrigir somente nesta compra</button></div>}
            {asksPackage && <><p className="quantity-guidance">Informe o conteúdo de <strong>cada</strong> caixa, pacote ou bandeja — não repita a quantidade da nota.</p>
                <div className="stock-fields"><label>Conteúdo de cada embalagem *<input aria-label="Conteúdo de cada embalagem" type="number" min="0" step="any" value={packageQuantity} onChange={e => setPackageQuantity(e.target.value)} /></label>
                    <label>Unidade do conteúdo *<select aria-label="Unidade do conteúdo" value={packageUnit} onChange={e => setPackageUnit(e.target.value as UnitOfMeasure | "")}><option value="">Selecione</option>{units.map(unit => <option key={unit} value={unit}>{unit}</option>)}</select></label></div>
                {!!calculatedTotal && packageUnit && <div className="quantity-calculation"><span>{decimal(item.quantity)} embalagens × {decimal(Number(packageQuantity))} {packageUnit}</span><strong>Entrada na despensa: {decimal(calculatedTotal)} {packageUnit}</strong></div>}</>}
            {manualOverride && <><p className="quantity-guidance">Esta correção vale apenas para esta compra e não altera o produto cadastrado.</p>
                <div className="stock-fields"><label>Entrada total nesta compra *<input aria-label="Entrada total nesta compra" type="number" min="0" step="any" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} /></label>
                    <label>Unidade da entrada *<select aria-label="Unidade da entrada" value={stockUnit} onChange={e => setStockUnit(e.target.value as UnitOfMeasure | "")}><option value="">Selecione</option>{units.map(unit => <option key={unit} value={unit}>{unit}</option>)}</select></label></div>
                {knownConversion && <button type="button" className="quantity-correction" onClick={() => setManualOverride(false)}>Usar novamente a conversão cadastrada</button>}</>}
        </section>}
        {error && <div className="fiscal-alert" role="alert">{error}</div>}
        <div className="editor-actions"><button className="fiscal-secondary" onClick={onCancel}>Cancelar</button>
            <button className="fiscal-primary" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar decisão"}</button></div>
    </div>;
};

const FiscalReceiptReviewGuided: React.FC = () => {
    const { pantryId: pantryValue, importId: importValue } = useParams<{ pantryId: string; importId: string }>();
    const pantryId = Number(pantryValue), importId = Number(importValue); const navigate = useNavigate();
    const [receipt, setReceipt] = useState<FiscalReceiptImportResponse | null>(null); const [expanded, setExpanded] = useState<number | null>(null);
    const [loading, setLoading] = useState(true); const [confirming, setConfirming] = useState(false); const [error, setError] = useState("");
    const [helpOpen, setHelpOpen] = useState(false);
    useEffect(() => { fetchFiscalReceiptImport(importId).then(setReceipt).catch(e => setError(fiscalReceiptErrorMessage(e))).finally(() => setLoading(false)); }, [importId]);
    const resolved = receipt?.items.filter(item => item.resolutionAction).length || 0;
    const canConfirm = useMemo(() => !!receipt && receipt.items.length > 0 && receipt.items.every(isReady), [receipt]);
    const confirm = async () => {
        if (!receipt || !window.confirm("Confirmar a compra e adicionar as entradas à despensa?")) return;
        setConfirming(true); setError("");
        try { await confirmFiscalReceiptImport(receipt.id); navigate(`/pantry/${pantryId}`, { state: { fiscalReceiptConfirmed: true } }); }
        catch (requestError) { setError(fiscalReceiptErrorMessage(requestError)); setConfirming(false); }
    };
    if (loading) return <main className="fiscal-page"><p>Carregando nota...</p></main>;
    if (!receipt) return <main className="fiscal-page"><div className="fiscal-alert">{error || "Nota não encontrada."}</div></main>;
    return <main className="fiscal-page"><div className="fiscal-page-title"><div><span className="fiscal-kicker">Revisão da NFC-e #{receipt.id}</span><h1>{receipt.issuerName}</h1>
        <p>{receipt.purchaseDate ? new Date(receipt.purchaseDate).toLocaleString("pt-BR") : "Data não informada"} • {money(receipt.paidValue)}</p></div>
        <div className="review-title-actions"><button className="quantity-help-button" onClick={() => setHelpOpen(true)}>? Como preencher?</button><button className="fiscal-secondary" onClick={() => navigate(`/pantry/${pantryId}/fiscal-receipts`)}>Salvar e sair</button></div></div>
        <div className="review-summary"><strong>{resolved} de {receipt.items.length} itens revisados</strong><div className="fiscal-progress"><span style={{ width: `${resolved * 100 / receipt.items.length}%` }} /></div></div>
        {error && <div className="fiscal-alert" role="alert">{error}</div>}
        <div className="fiscal-items">{receipt.items.map(item => <article className={`fiscal-item ${item.resolutionAction ? "resolved" : ""}`} key={item.id}>
            <button className="item-summary" onClick={() => setExpanded(expanded === item.id ? null : item.id)} aria-expanded={expanded === item.id}>
                <span className="item-number">{item.itemNumber}</span><span className="item-description"><strong>{item.description}</strong><small>{item.quantity} {item.commercialUnit} • {money(item.totalPrice)}</small></span>
                <span className="item-status">{item.resolutionAction ? "Salvo" : "Pendente"}</span></button>
            {expanded === item.id && <FiscalItemEditor importId={receipt.id} item={item} onHelp={() => setHelpOpen(true)} onCancel={() => setExpanded(null)} onSaved={value => { setReceipt(value); setExpanded(null); }} />}
        </article>)}</div>
        <div className="confirm-bar"><div><strong>{canConfirm ? "Revisão completa" : "Ainda existem itens pendentes"}</strong><p>Você pode sair e continuar depois.</p></div>
            <button className="fiscal-primary" disabled={!canConfirm || confirming} onClick={confirm}>{confirming ? "Confirmando..." : "Confirmar compra"}</button></div>
        <FiscalQuantityHelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </main>;
};
export default FiscalReceiptReviewGuided;
