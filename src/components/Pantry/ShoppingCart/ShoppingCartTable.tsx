import React, { useState } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";
import "../../../styles/components/Shopping/ShoppingCartTable.css";
import { ShoppingCartProduct } from "../../../services/shopping/shoppingCartService";
import ProductSelectionModal from "../../ShoppingListProduct/ProductSelectionModal/ProductSelectionModal";
import { ShoppingListProduct } from "../../../services/shopping/shoppingListService";

interface ShoppingCartTableProps {
    products: ShoppingCartProduct[];
    availableProducts: { id: number; name: string }[];
    onUpdateProduct: (product: ShoppingCartProduct) => void;
    onRemoveProduct: (productId: number) => void;
    onAddProducts: (selectedProducts: ShoppingListProduct[]) => void;
}

const ShoppingCartTable: React.FC<ShoppingCartTableProps> = ({
    products,
    availableProducts,
    onUpdateProduct,
    onRemoveProduct,
    onAddProducts,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        product: ShoppingCartProduct,
        field: "cartQuantity" | "price" | "unityPrice"
    ) => {
        const newValue = parseFloat(e.target.value) || 0;
        let updatedProduct = { ...product };
    
        switch (field) {
            case "cartQuantity":
                updatedProduct.cartQuantity = newValue;
                if (updatedProduct.unityPrice) {
                    updatedProduct.price = updatedProduct.cartQuantity * updatedProduct.unityPrice;
                } else if (updatedProduct.price) {
                    updatedProduct.unityPrice = updatedProduct.price / updatedProduct.cartQuantity;
                }
                break;
    
            case "unityPrice":
                updatedProduct.unityPrice = newValue;
                if (updatedProduct.cartQuantity) {
                    updatedProduct.price = updatedProduct.cartQuantity * updatedProduct.unityPrice;
                }
                break;
    
            case "price":
                updatedProduct.price = newValue;
                if (updatedProduct.cartQuantity) {
                    updatedProduct.unityPrice = updatedProduct.price / updatedProduct.cartQuantity;
                }
                break;
    
            default:
                break;
        }
    
        // Chama a função para atualizar o item com os novos valores calculados
        onUpdateProduct(updatedProduct);
    };
    


    return (
        <div>
            <table className="shopping-cart-table">
                <thead>
                    <tr>
                        <th>Nome do Produto</th>
                        <th>Quantidade Necessária</th>
                        <th>Quantidade no Carrinho</th>
                        <th>Preço Unitário (R$)</th>
                        <th>Preço Total (R$)</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {products
                        .slice()
                        .sort((a, b) => a.id - b.id) // Ensure items are ordered by ID
                        .map((product) => (
                            <tr key={product.id}>
                                <td>{product.product.brand}</td>
                                <td>{product.plannedQuantity}</td>
                                <td>
                                    <input
                                        type="number"
                                        value={product.cartQuantity}
                                        onChange={(e) =>
                                            handleInputChange(e, product, "cartQuantity")
                                        }
                                        min="0"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={product.unityPrice}
                                        onChange={(e) =>
                                            handleInputChange(e, product, "unityPrice")
                                        }
                                        step="0.01"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={product.price}
                                        onChange={(e) =>
                                            handleInputChange(e, product, "price")
                                        }
                                        step="0.01"
                                    />
                                </td>
                                <td>
                                    <button
                                        className="remove-button"
                                        onClick={() => onRemoveProduct(product.id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "10px" }}>
                            <button className="add-products-button" onClick={() => setIsModalOpen(true)}>
                                <FaPlus /> Adicionar Itens
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            {isModalOpen && (
                <ProductSelectionModal
                    availableProducts={availableProducts}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={onAddProducts}
                />
            )}
        </div>
    );
};

export default ShoppingCartTable;
