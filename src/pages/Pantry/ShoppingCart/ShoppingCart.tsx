import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "../../../styles/pages/Shopping/ShoppingCart.css";
import { useShoppingCart } from "../../../hooks/useShoppingCart";
import ShoppingCartTable from "../../../components/Pantry/ShoppingCart/ShoppingCartTable";
import { usePantryDetail } from "../../../hooks/pentry/usePantryDetail";
import { FaPlus } from "react-icons/fa";
import ProductSelectionModal from "../../../components/ShoppingListProduct/ProductSelectionModal/ProductSelectionModal";

const ShoppingCart: React.FC = () => {
    const { cart, loading, error, handleUpdateCartProduct, handleRemoveCartProduct, handleFinalizePurchase, handleAddToCart } = useShoppingCart();
    const { state } = usePantryDetail()
    const [isModalOpen, setIsModalOpen] = useState(false);
    console.log("LOGG cart", cart)
    if (loading) {
        return <p>Carregando carrinho...</p>;
    }

    if (error) {
        return <p className="error">Erro ao carregar o carrinho: {error}</p>;
    }


    return (
        <div className="shopping-cart-container">
            <h2>Carrinho de Compras</h2>

            {cart?.cartProducts?.length ? (
                <div className="shopping-cart-products">
                    <ShoppingCartTable
                        products={cart.cartProducts}
                        onUpdateProduct={handleUpdateCartProduct}
                        onRemoveProduct={handleRemoveCartProduct}
                        onAddProducts={handleAddToCart}
                    />
                </div>
            ) : (
                <>
                    <p className="empty-cart">O carrinho está vazio. Adicione itens abaixo:</p>
                    <button className="add-products-button" onClick={() => setIsModalOpen(true)}>
                        <FaPlus /> Adicionar Itens
                    </button>
                </>
            )
            }
            {
                (cart?.cartProducts?.length ?? 0) > 0 && (
                    <button className="finalize-button" onClick={handleFinalizePurchase}>
                        Finalizar Compra
                    </button>
                )
            }
        </div >
    );
};

export default ShoppingCart;
