import React from "react";
import { usePantry } from "../../hooks/usePantry";
// Componentes
import ItemSelectionModal from "../../components/ShoppingListItem/ItemSelectionModal/ItemSelectionModal";
import ShoppingListItemCard from "../../components/ShoppingListItem/ShoppingListItemCard";
// Estilos
import "../../styles/PantryDetail.css";

const PantryDetail: React.FC = () => {
    const { state, dispatch, handleAddItemsToShoppingList, handleUpdateQuantity, handleRemoveItem } = usePantry();

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
                    <p className="low-quantity">{state.pantry?.lowQuantityItems?.length} itens quase acabando</p>
                </div>
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
                {state.activeTab === "shoppingList" && (
                    <div className="tab-shopping-list">
                        <h3>Lista de Compras</h3>
                        <button className="add-items-auto-button" onClick={() => dispatch({ type: "TOGGLE_MODAL" })}>
                            Adicionar Itens
                        </button>
                        <div className="shopping-list">
                            {state.shoppingList?.items
                                .slice() // Creates a copy to avoid modifying state directly
                                .sort((a, b) => a.ingredientId - b.ingredientId) // Sort by ingredientId
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
            </div>

            {/* Modal de Seleção de Itens */}
            {state.isModalOpen && (
                <ItemSelectionModal availableItems={state.availableItems} onClose={() => dispatch({ type: "TOGGLE_MODAL" })} onConfirm={handleAddItemsToShoppingList} />
            )}
        </div>
    );
};

export default PantryDetail;
