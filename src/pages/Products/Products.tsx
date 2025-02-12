import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductCard from "../../components/Product/ProductCard";
import { useUser } from "../../context/UserContext";
import { useProduct } from "../../hooks/useProduct";
import ProductForm from "../../components/Product/ProductForm";
import "../../styles/pages/Product/Products.css";

const Products = () => {
    const { id } = useParams(); // Verifica se há um pantryId na URL
    const { state, handleSearch, handleAddProductToShoppingList,handleUpdateQuantity, handleRemoveProduct } = useProduct();
    const { user } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate(); // Hook para navegação
console.log("LOGG", state)

    const shoppingListProducts = state.shoppingList.items.reduce((map, item) => {
        map[item.productId] = {
            quantity: item.quantity,
            shoppingListProductId: item.id, // ID do item dentro da lista de compras
        };
        return map;
    }, {} as Record<number, { quantity: number; shoppingListProductId: number }>);
console.log("shoppingListProducts", shoppingListProducts)
    return (
        <div className="products-page">
            <button onClick={() => navigate(`/pantry/${id}`)}>Voltar</button>
            <h2>Produtos</h2>

            <div className="product-search">
                <button onClick={handleSearch}>Buscar</button>
            </div>

            {/* Se tiver pantryId, adiciona à lista de compras da despensa correspondente */}
            {id ? (
                <p>Adicione produtos à lista de compras da despensa ID: {id}</p>
            ) : (
                user?.roles.includes("ROLE_ADMIN") && (
                    <button
                        className="add-product-button"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Adicionar Produto
                    </button>
                )
            )}

            <div className="product-list">
                {state.loading ? (
                    <p>Carregando produtos...</p>
                ) : state.error ? (
                    <p>{state.error}</p>
                ) : state.products.length === 0 ? (
                    <p>Nenhum produto encontrado.</p>
                ) : (
                    state.products.map((product) => {
                        const productData = shoppingListProducts[product.id] || { quantity: 0, shoppingListProductId: null };

                        return (
                            <ProductCard
                                key={product.id}
                                product={product}
                                handleAddProductToShoppingList={handleAddProductToShoppingList}
                                onUpdateQuantity={handleUpdateQuantity}
                                onRemoveProduct={handleRemoveProduct}
                                initialQuantity={productData.quantity}
                                shoppingListProductId={productData.shoppingListProductId} // Passamos o ID do item na lista
                            />
                        );
                    })
                )}
            </div>

            {isModalOpen && <ProductForm />}

        </div>
    );
};

export default Products;
