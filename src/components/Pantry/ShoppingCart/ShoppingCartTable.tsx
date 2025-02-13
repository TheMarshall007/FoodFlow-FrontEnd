import React, { useState } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";
import "../../../styles/components/Shopping/ShoppingCartTable.css";
import { ShoppingCartProduct } from "../../../services/shopping/shoppingCartService";
import { ShoppingListProduct } from "../../../services/shopping/shoppingListService";
import ProductSelectionModal from "../../Product/ProductSelectionModal";

interface ShoppingCartTableProps {
    products: ShoppingCartProduct[];
    onUpdateProduct: (product: ShoppingCartProduct) => void;
    onRemoveProduct: (productId: number) => void;
    onAddProducts: (selectedProducts: ShoppingListProduct[]) => void;
}

const ShoppingCartTable: React.FC<ShoppingCartTableProps> = ({
    products,
    onUpdateProduct,
    onRemoveProduct,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        product: ShoppingCartProduct,
        field: "purchasedQuantity" | "price" | "unityPrice"
    ) => {
        const newValue = parseFloat(e.target.value) || 0;
        let updatedProduct = { ...product };
        switch (field) {
            case "purchasedQuantity":
                updatedProduct.purchasedQuantity = newValue;
                if (updatedProduct.unityPrice) {
                    updatedProduct.totalPrice = updatedProduct.purchasedQuantity * updatedProduct.unityPrice;
                } else if (updatedProduct.totalPrice) {
                    updatedProduct.unityPrice = updatedProduct.totalPrice / updatedProduct.purchasedQuantity;
                }
                break;
            case "unityPrice":
                updatedProduct.unityPrice = newValue;
                if (updatedProduct.purchasedQuantity) {
                    updatedProduct.totalPrice = updatedProduct.purchasedQuantity * updatedProduct.unityPrice;
                }
                break;
            case "price":
                updatedProduct.totalPrice = newValue;
                if (updatedProduct.purchasedQuantity) {
                    updatedProduct.unityPrice = updatedProduct.totalPrice / updatedProduct.purchasedQuantity;
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
                                <td>
                                    {product?.systemProduct?.variety?.ingredient?.name ?? "Produto Desconhecido"} -
                                    {product?.systemProduct?.variety?.name ?? "Variedade Desconhecida"}
                                    ({product?.systemProduct?.brand ?? "Marca Desconhecida"})
                                </td>
                                <td>{product.plannedQuantity}</td>
                                <td>
                                    <input
                                        type="number"
                                        value={product.purchasedQuantity}
                                        onChange={(e) =>
                                            handleInputChange(e, product, "purchasedQuantity")
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
                                        value={product.totalPrice}
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
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={() => {console.log("Confirma")}}
                />
            )}

        </div>
    );
};

export default ShoppingCartTable;
