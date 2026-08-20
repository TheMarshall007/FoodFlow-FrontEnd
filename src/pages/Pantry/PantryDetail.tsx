import React, { useCallback, useEffect, useState } from "react";
import { usePantryDetail } from "../../hooks/pentry/usePantryDetail";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ProductCard from "../../components/Product/ProductCard";
import "../../styles/pages/Pantry/PantryDetail.css";
import FiscalReceiptImportModal from "../../components/FiscalReceipt/FiscalReceiptImportModal";
import { fetchPendingFiscalReceipts } from "../../services/fiscalReceipt/fiscalReceiptService";

const PantryDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const pantryId = id ? parseInt(id) : 0;
    const { state, dispatch, handleUpdateProductQuantityInShoppingList, handleRemoveProductFromShoppingList, handleReduceQuantity } = usePantryDetail(pantryId);
    const navigate = useNavigate(); // Hook para navegação
    const location = useLocation();
    const routeState = location.state as { fiscalReceiptConfirmed?: boolean } | null;
    const [nfceModalOpen, setNfceModalOpen] = useState(false);
    const [nfceSuccess, setNfceSuccess] = useState(
        routeState?.fiscalReceiptConfirmed ? "Compra confirmada e despensa atualizada." : ""
    );
    const [pendingReviews, setPendingReviews] = useState(0);

    const refreshPendingReviews = useCallback(async () => {
        if (!pantryId) return;
        try {
            const pending = await fetchPendingFiscalReceipts(pantryId);
            setPendingReviews(pending.length);
        } catch {
            // O contador não deve impedir o uso normal da despensa.
        }
    }, [pantryId]);

    useEffect(() => {
        void refreshPendingReviews();
    }, [refreshPendingReviews]);

    if (!state.pantry) {
        return <p>Carregando ou despensa não encontrada...</p>;
    }

    console.log("LOGG STATE DETAIL", state);

    return (
        <div className="pantry-detail-container">
            <div className="pantry-header">
                <img src={state.pantry?.image} alt={state.pantry?.propertyName} className="pantry-image" />
                <div className="pantry-info">
                    <h2>{state.pantry?.propertyName}</h2>
                    <p>{state.pantry?.sharedWith?.length ?? 0} Menu vinculado</p>
                    <p className="low-quantity-text">{state.pantry?.lowQuantityProducts?.length} itens quase acabando</p>
                </div>
                <button className="back-button" onClick={() => navigate("/pantries")}>Voltar</button>
            </div>

            <div className="nfce-import-bar">
                <button className="nfce-import-button" onClick={() => { setNfceSuccess(""); setNfceModalOpen(true); }}>
                    Importar NFC-e
                </button>
                <button className="nfce-review-button" onClick={() => navigate(`/pantry/${pantryId}/fiscal-receipts`)}>
                    Revisões pendentes ({pendingReviews})
                </button>
                {nfceSuccess && <p role="status">{nfceSuccess}</p>}
            </div>

            {/* Abas de navegação */}
            <div className="pantry-tabs">
                <button className={`tab-button ${state.activeTab === "products" ? "active" : ""}`} onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "products" })}>
                    Itens na Dispensa
                </button>
                <button className={`tab-button ${state.activeTab === "shoppingList" ? "active" : ""}`} onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "shoppingList" })}>
                    Lista de Compras
                </button>
                <button className={`tab-button ${state.activeTab === "history" ? "active" : ""}`} onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "history" })}>
                    Histórico de Compras
                </button>
            </div>

            {/* Conteúdo das abas */}
            <div className="tab-content">
                {/* Pantry Products */}
                {state.activeTab === "products" &&
                    <div className="tab-items">
                        <div className="items-grid">
                            {state.pantry?.products?.slice()
                                .sort((a, b) => a.id - b.id)
                                .map((product) => {
                                    const isLowQuantity = state.pantry.lowQuantityProducts?.some(lowProduct => lowProduct.id === product.id);
                                    return (
                                        <ProductCard
                                            key={product.id}
                                            product={product.systemProduct}
                                            isLowQuantity={isLowQuantity}
                                            actions={
                                                <div>
                                                    <h3>Quantitdade: {product.quantity} {product.unit}</h3>
                                                    <div className="product-quantity-control">
                                                        <button
                                                            className="quantity-button"
                                                            onClick={() => handleReduceQuantity(state.pantry.id, product.id, 1)}
                                                        >
                                                            -1
                                                        </button>
                                                        <button
                                                            className="quantity-button"
                                                            onClick={() => handleReduceQuantity(state.pantry.id, product.id, 2)}
                                                        >
                                                            -2
                                                        </button>
                                                        <button
                                                            className="quantity-button"
                                                            onClick={() => handleReduceQuantity(state.pantry.id, product.id, 5)}
                                                        >
                                                            -5
                                                        </button>
                                                    </div>
                                                </div>
                                            }
                                        />
                                    );
                                })}
                        </div>
                    </div>
                }

                {/* Shopping List */}
                {state.activeTab === "shoppingList" && (
                    <div className="tab-shopping-list">
                        <button className="add-items-auto-button" onClick={() => navigate(`/products/${state.pantry.id}`)}>
                            Adicionar Itens
                        </button>
                        <button className="view-cart-button" onClick={() => navigate(`/shopping-cart/${state?.pantry?.id}`)}>
                            Ver Carrinho
                        </button>
                        <div className="shopping-list">
                            {state.shoppingList?.products
                                .slice()
                                .sort((a, b) => {
                                    const gtinA = typeof a.systemProductGtin === 'string' ? parseInt(a.systemProductGtin, 10) : a.systemProductGtin ?? 0;
                                    const gtinB = typeof b.systemProductGtin === 'string' ? parseInt(b.systemProductGtin, 10) : b.systemProductGtin ?? 0;
                                    return gtinA - gtinB;
                                })
                                .map((product, index) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product.systemProduct}
                                        actions={
                                            <div>
                                                <h3>Quantitdade: {product.plannedQuantity}</h3>
                                                <div className="product-quantity-control">
                                                    <button className="quantity-button" key={`add-${index}`}
                                                        onClick={() => handleUpdateProductQuantityInShoppingList(product.id, product.plannedQuantity + 1)}>+1</button>
                                                    <button className="quantity-button" key={`remove-${index}`}
                                                        onClick={() => handleUpdateProductQuantityInShoppingList(product.id, product.plannedQuantity - 1)}>-1</button>
                                                    <button className="quantity-button"
                                                        onClick={() => handleRemoveProductFromShoppingList(product.id)}>🗑</button>
                                                </div>
                                            </div>
                                        }
                                    />
                                ))}
                        </div>
                    </div>
                )}

                {/* Shopping History */}
                {state.activeTab === "history" && (
                    <div className="tab-shopping-list">
                        {state.history.length > 0 ? (
                            <div className="tab-history">
                                <table className="history-table">
                                    <thead>
                                        <tr>
                                            <th>N°</th>
                                            <th>Data da Compra</th>
                                            <th>Valor Total (R$)</th>
                                            <th>Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {state.history.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.id}</td>
                                                <td>{new Date(item.purchaseDate.toString()).toLocaleDateString()}</td>
                                                <td>{item?.totalValue?.toFixed(2)}</td>
                                                <td className="table-action">
                                                    <button onClick={() => { }}>Ver carrinho</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>Não há histórico de compras disponível.</p>
                        )}
                    </div>
                )}
            </div>
            <FiscalReceiptImportModal open={nfceModalOpen} pantryId={pantryId}
                onClose={() => setNfceModalOpen(false)} onSuccess={() => {
                    setNfceSuccess("Nota fiscal importada e aguardando revisão.");
                    void refreshPendingReviews();
                }} />
        </div>
    );
};

export default PantryDetail;
