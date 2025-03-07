import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductCard from "../../components/Product/ProductCard";
import { useUser } from "../../context/UserContext";
import { useProduct } from "../../hooks/useProduct";
import ProductForm from "../../components/Product/ProductForm";
import "../../styles/pages/Product/Products.css";
import { Product } from "../../services/product/productService";

const Products = () => {
    let { id } = useParams<{ id: string }>();
    const { state, handleSearch, handleAddProductToShoppingList, handleUpdateQuantity, handleRemoveProductFromShoppingList } = useProduct();
    const { user } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    // Mapear produtos já na lista de compras
    const shoppingListProducts = state.shoppingList?.products.reduce((map: Record<string, { plannedQuantity: number; shoppingListProductId: number }>, product) => {
        map[product.systemProductGtin!.toString()] = {
            plannedQuantity: product.plannedQuantity,
            shoppingListProductId: product.id,
        };
        return map;
    }, {} as Record<string, { plannedQuantity: number; shoppingListProductId: number }>);

    // Função para adicionar um produto à lista de compras
    const handleAddProduct = (product: Product) => {
        handleAddProductToShoppingList({ productGtin: product.gtin, quantity: 1 });
    };

    // Função para aumentar quantidade de um produto já adicionado
    const handleIncrease = (productId: number, currentQuantity: number) => {
        handleUpdateQuantity(productId, currentQuantity + 1);
    };

    // Função para diminuir quantidade ou remover produto se zerado
    const handleDecrease = (productId: number, currentQuantity: number, shoppingListProductId: number) => {
        if (currentQuantity <= 1) {
            handleRemoveProductFromShoppingList(shoppingListProductId);
        } else {
            handleUpdateQuantity(productId, currentQuantity - 1);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, shoppingListProductId: number) => {
        const newQuantity = Math.max(parseInt(e.target.value) || 0, 0);
        if (newQuantity === 0) {
            handleRemoveProductFromShoppingList(shoppingListProductId);
        } else {
            handleUpdateQuantity(shoppingListProductId, newQuantity);
        }
    };


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
                    <button className="add-product-button" onClick={() => setIsModalOpen(true)}>
                        Adicionar Produto
                    </button>
                )
            )}

            <div className="product-list">
                {state.loading ? (
                    <p>Carregando produtos...</p>
                ) : state.error ? (
                    <p>{state.error}</p>
                ) : state.systemProduct.length === 0 ? (
                    <p>Nenhum produto encontrado.</p>
                ) : (
                    state.systemProduct.map((product: Product) => {
                        const productData = shoppingListProducts[product.gtin.toString()] || { plannedQuantity: 0, shoppingListProductId: null };
                        console.log("LOGG state", state)
                        return (
                            <ProductCard
                                key={product.gtin}
                                product={product}
                                isSelected={productData.shoppingListProductId !== null}
                                actions={
                                    productData.plannedQuantity === 0 ? (
                                        <button onClick={() => handleAddProduct(product)}>Adicionar à Lista</button>
                                    ) : (
                                        <div className="quantity-controls">
                                            <button onClick={() => handleDecrease(productData.shoppingListProductId, productData.plannedQuantity, productData.shoppingListProductId)}>
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                value={productData.plannedQuantity}
                                                onChange={(e) => handleInputChange(e, productData.shoppingListProductId)}
                                                min="0"
                                            />
                                            <button onClick={() => handleIncrease(productData.shoppingListProductId, productData.plannedQuantity)}>
                                                +
                                            </button>
                                        </div>
                                    )
                                }
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
