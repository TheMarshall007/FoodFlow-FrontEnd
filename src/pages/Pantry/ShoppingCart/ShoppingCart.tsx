import React from "react";
import { useParams } from "react-router-dom";
import "../../../styles/pages/Shopping/ShoppingCart.css";
import { useShoppingCart } from "../../../hooks/useShoppingCart";
import ShoppingCartTable from "../../../components/Pantry/ShoppingCart/ShoppingCartTable";
import { usePantry } from "../../../hooks/usePantry";

const ShoppingCart: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const pantryId = id ? parseInt(id) : 0;
    const { cart, loading, error, handleUpdateCartItem, handleRemoveCartItem, handleFinalizePurchase, handleAddToCart } = useShoppingCart(pantryId);
    const { state } = usePantry()
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
                <p className="empty-cart">O carrinho está vazio.</p>
            )}

            {(cart?.items?.length ?? 0) > 0 && (
                <button className="finalize-button" onClick={handleFinalizePurchase}>
                    Finalizar Compra
                </button>
            )}
        </div>
    );
};

export default ShoppingCart;
