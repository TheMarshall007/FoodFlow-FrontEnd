import React, { useState } from "react";
import "../../../styles/pages/Shopping/ShoppingCart.css";
import { useShoppingCart } from "../../../hooks/useShoppingCart";
import ShoppingCartTable from "../../../components/Pantry/ShoppingCart/ShoppingCartTable";
import { FaPlus } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import ProductSelectionModal from "../../../components/Product/ProductSelectionModal";

const ShoppingCart: React.FC = () => {
    let { id } = useParams<{ id: string }>();
    const { cart, loading, error, handleUpdateCartProduct, handleUpdateCartProductList, handleRemoveCartProduct, handleFinalizePurchase, handleAddToCart } = useShoppingCart();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate(); // Hook para navegação
    const [isAdvancedMode, setIsAdvancedMode] = useState(false); // 🚀 Estado de Modo Avançado

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
            <button className="back-button" onClick={() => navigate(`/pantry/${id}`)}>Voltar</button>

            {cart?.cartProducts?.length ? (
                <div className="shopping-cart-products">
                    <ShoppingCartTable
                        products={cart.cartProducts}
                        onUpdateProduct={handleUpdateCartProduct}
                        onUpdateProductList={handleUpdateCartProductList}
                        onRemoveProduct={handleRemoveCartProduct}
                        onAddProducts={handleAddToCart}
                        isAdvancedMode={isAdvancedMode}
                        setIsAdvancedMode={setIsAdvancedMode}
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
                    <button className="finalize-button" onClick={() => handleFinalizePurchase(isAdvancedMode)}>
                        Finalizar Compra
                    </button>
                )
            }

            {isModalOpen && (
                <ProductSelectionModal
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={(selectedProducts) => {
                        setIsModalOpen(false);
                        if (selectedProducts.length !== 0) {
                            const formattedProducts = selectedProducts.map((product) => ({
                                productId: product.id,
                                cartQuantity: 0,
                                price: 0,
                            }));
                            handleAddToCart(formattedProducts);
                        }
                    }}
                />
            )}
        </div >
    );
};

export default ShoppingCart;
