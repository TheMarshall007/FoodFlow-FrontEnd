import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "../../../styles/pages/Shopping/ShoppingCart.css";
import { useShoppingCart } from "../../../hooks/useShoppingCart";
import ShoppingCartTable from "../../../components/Pantry/ShoppingCart/ShoppingCartTable";
import { usePantryDetail } from "../../../hooks/pentry/usePantryDetail";
import { FaPlus } from "react-icons/fa";
import ItemSelectionModal from "../../../components/ShoppingListItem/ItemSelectionModal/ItemSelectionModal";

const ShoppingCart: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const pantryId = id ? parseInt(id) : 0;
    const { cart, loading, error, handleUpdateCartItem, handleRemoveCartItem, handleFinalizePurchase, handleAddToCart } = useShoppingCart(pantryId);
    const { state } = usePantryDetail()
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (loading) {
        return <p>Carregando carrinho...</p>;
    }

    if (error) {
        return <p className="error">Erro ao carregar o carrinho: {error}</p>;
    }


    return (
        <div className="shopping-cart-container">
            <h2>Carrinho de Compras</h2>

            {cart?.items?.length ? (
                <div className="shopping-cart-items">
                    <ShoppingCartTable
                        items={cart?.items}
                        onUpdateItem={handleUpdateCartItem}
                        onRemoveItem={handleRemoveCartItem}
                        onAddItems={handleAddToCart}
                        availableItems={state.availableItems}
                    />
                </div>
            ) : (
                <>
                    <p className="empty-cart">O carrinho está vazio. Adicione itens abaixo:</p>
                    <button className="add-items-button" onClick={() => setIsModalOpen(true)}>
                        <FaPlus /> Adicionar Itens
                    </button>
                </>
            )
            }

            {isModalOpen && (
                <ItemSelectionModal
                    availableItems={state.availableItems}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleAddToCart}
                />
            )}

            {
                (cart?.items?.length ?? 0) > 0 && (
                    <button className="finalize-button" onClick={handleFinalizePurchase}>
                        Finalizar Compra
                    </button>
                )
            }
        </div >
    );
};

export default ShoppingCart;
