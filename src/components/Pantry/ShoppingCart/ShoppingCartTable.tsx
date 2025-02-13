import React, { useState } from "react";
import { FaTrash, FaPlus, FaClipboard, FaLightbulb } from "react-icons/fa";
import "../../../styles/components/Shopping/ShoppingCartTable.css";
import { ShoppingCartProduct, ShoppingCartProductInsert } from "../../../services/shopping/shoppingCartService";
import ProductSelectionModal from "../../Product/ProductSelectionModal";

interface ShoppingCartTableProps {
    products: ShoppingCartProduct[];
    onUpdateProduct: (product: ShoppingCartProduct) => void;
    onRemoveProduct: (productId: number) => void;
    onAddProducts: (selectedProducts: ShoppingCartProductInsert[]) => void;
}

const ShoppingCartTable: React.FC<ShoppingCartTableProps> = ({
    products,
    onUpdateProduct,
    onRemoveProduct,
    onAddProducts
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editValues, setEditValues] = useState<{ [key: number]: Partial<ShoppingCartProduct> }>({});

    const parseBigDecimal = (value: string | number): number => {
        return typeof value === "string" ? parseFloat(value.replace(",", ".")) || 0 : value;
    };

    const formatBigDecimal = (value: string | number): number => {
        return parseFloat(parseBigDecimal(value).toFixed(2));
    };

    const handleEditChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        product: ShoppingCartProduct,
        field: keyof ShoppingCartProduct
    ) => {
        const newValue = e.target.value;
        setEditValues((prev) => ({
            ...prev,
            [product.id]: {
                ...prev[product.id],
                [field]: newValue
            }
        }));
    };

    const handleEditBlur = (
        product: ShoppingCartProduct,
        field: keyof ShoppingCartProduct
    ) => {
        const newValue = parseBigDecimal(
            (editValues[product.id]?.[field as keyof ShoppingCartProduct] as string | number) ??
            (product[field as keyof ShoppingCartProduct] as string | number) ??
            0 // Valor padrão para evitar erro
        );


        let updatedProduct: ShoppingCartProduct = {
            ...product,
            [field]: formatBigDecimal(newValue)
        };

        if (field === "purchasedQuantity" || field === "unitPrice") {
            updatedProduct.totalPrice = formatBigDecimal(
                parseBigDecimal(updatedProduct.purchasedQuantity) * parseBigDecimal(updatedProduct.unitPrice)
            );
        } else if (field === "totalPrice") {
            updatedProduct.unitPrice = formatBigDecimal(
                parseBigDecimal(updatedProduct.totalPrice) / parseBigDecimal(updatedProduct.purchasedQuantity)
            );
        }

        onUpdateProduct(updatedProduct);

        setEditValues((prev) => {
            const newValues = { ...prev };
            delete newValues[product.id];
            return newValues;
        });
    };

    const totalPrice = products.reduce((sum, product) => sum + (product.totalPrice || 0), 0);


    return (
        <div>
            <table className="shopping-cart-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Nome do Produto</th>
                        <th>Quantidade Necessária</th>
                        <th>Quantidade no Carrinho</th>
                        <th>Preço Unitário (R$)</th>
                        <th>Preço Total (R$)</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td>
                                {product.plannedQuantity !== null ? <FaClipboard /> : <FaLightbulb />}
                            </td>
                            <td>
                                {product?.systemProduct?.variety?.ingredient?.name ?? "Produto Desconhecido"} -{" "}
                                {product?.systemProduct?.variety?.name ?? "Variedade Desconhecida"}{" "}
                                ({product?.systemProduct?.brand ?? "Marca Desconhecida"})
                            </td>
                            <td>
                                {product.plannedQuantity !== null ? `${product.plannedQuantity} ${product.plannedUnit}` : ""}
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value={editValues[product.id]?.purchasedQuantity ?? product.purchasedQuantity}
                                    onChange={(e) => handleEditChange(e, product, "purchasedQuantity")}
                                    onBlur={() => handleEditBlur(product, "purchasedQuantity")}
                                    min="0"
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value={editValues[product.id]?.unitPrice ?? product.unitPrice}
                                    onChange={(e) => handleEditChange(e, product, "unitPrice")}
                                    onBlur={() => handleEditBlur(product, "unitPrice")}
                                    step="0.01"
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value={editValues[product.id]?.totalPrice ?? product.totalPrice}
                                    onChange={(e) => handleEditChange(e, product, "totalPrice")}
                                    onBlur={() => handleEditBlur(product, "totalPrice")}
                                    step="0.01"
                                />
                            </td>
                            <td>
                                {product.plannedQuantity == null && (
                                    <button className="remove-button" onClick={() => onRemoveProduct(product.id)}>
                                        <FaTrash />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan={5} style={{ fontWeight: "bold", textAlign: "right" }}>Total:</td>
                        <td style={{ fontWeight: "bold" }}>{totalPrice.toFixed(2)}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "10px" }}>
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
                    onConfirm={(selectedProducts) => {
                        setIsModalOpen(false);
                        if (selectedProducts.length !== 0) {
                            const formattedProducts = selectedProducts.map((product) => ({
                                productId: product.id,
                                cartQuantity: 0,
                                price: 0,
                            }));
                            onAddProducts(formattedProducts);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default ShoppingCartTable;
