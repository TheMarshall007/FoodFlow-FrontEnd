import React from "react";
import { usePantryDetail } from "../../hooks/pentry/usePantryDetail";
import { useNavigate } from "react-router-dom";
import ItemSelectionModal from "../../components/ShoppingListItem/ItemSelectionModal/ItemSelectionModal";
import ShoppingListItemCard from "../../components/ShoppingListItem/ShoppingListItemCard";
import "../../styles/pages/Pantry/PantryDetail.css";

const PantryDetail: React.FC = () => {
    const { state, dispatch, handleUpdateQuantity, handleRemoveItem, handleReduceQuantity } = usePantryDetail();
    const navigate = useNavigate(); // Hook para navegação
    if (!state.pantry) {
        return <p>Carregando ou despensa não encontrada...</p>;
    }
    
    return (
        <div className="pantry-detail-container">
            <div className="pantry-header">
                <img src={state.pantry?.image} alt={state.pantry?.propertyName} className="pantry-image" />
                <div className="pantry-info">
                    <h2>{state.pantry?.propertyName}</h2>
                    <p>{state.pantry?.sharedWith?.length ?? 0} Menu vinculado</p>
                    <p className="low-quantity-text">{state.pantry?.lowQuantityItems?.length} itens quase acabando</p>
                </div>
                <button className="back-button" onClick={() => navigate("/pantries")}>Voltar</button>

            </div>

            {/* Abas de navegação */}
            <div className="pantry-tabs">
                <button className={`tab-button ${state.activeTab === "items" ? "active" : ""}`} onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "items" })}>
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
                {/* Pantry Items */}
                {state.activeTab === "items" &&
                    < div className="tab-items">
                        <div className="items-grid">
                            {state.pantry?.items?.slice()
                                .sort((a, b) => a.id - b.id)
                                .map((item) => {
                                    const isLowQuantity = state.pantry.lowQuantityItems?.some(lowItem => lowItem.id === item.id);
                                    return (
                                        <div
                                            key={item.id}
                                            className={`item-card ${isLowQuantity ? "low-quantity" : ""}`} // Adiciona uma classe condicional
                                        >
                                            <img
                                                src={item.ingredient?.image || "/assets/fotos/default-item.png"}
                                                alt={item.ingredient?.name}
                                                className="item-card-image"
                                            />
                                            <div className="item-card-info">
                                                <h4>{item.ingredient?.name}</h4>
                                                <p>Quantidade: {item.quantity}</p>
                                                <div className="item-quantity-control">
                                                    <button
                                                        className="quantity-button"
                                                        onClick={() => handleReduceQuantity(state.pantry.id, item.ingredient.id, 1)}
                                                    >
                                                        -1
                                                    </button>
                                                    <button
                                                        className="quantity-button"
                                                        onClick={() => handleReduceQuantity(state.pantry.id, item.ingredient.id, 2)}
                                                    >
                                                        -2
                                                    </button>
                                                    <button
                                                        className="quantity-button"
                                                        onClick={() => handleReduceQuantity(state.pantry.id, item.ingredient.id, 5)}
                                                    >
                                                        -5
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
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
                        {/* Botão para abrir o Carrinho de Compras */}
                        <button className="view-cart-button" onClick={() => navigate(`/shopping-cart/${state?.pantry?.id}`)}>
                            Ver Carrinho
                        </button>
                        <div className="shopping-list">
                            {state.shoppingList?.items
                                .slice()
                                .sort((a, b) => a.productId - b.productId)
                                .map((item) => (
                                    <ShoppingListItemCard
                                        key={item.id}
                                        item={item}
                                        onUpdateQuantity={handleUpdateQuantity}
                                        onRemoveItem={handleRemoveItem}
                                    />))}
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
                                                <td>{item.totalValue.toFixed(2)}</td>
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

        </div >
    );
};

export default PantryDetail;
