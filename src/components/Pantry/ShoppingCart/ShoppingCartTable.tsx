import React, { useState } from "react";
import { FaTrash, FaPlus, FaClipboard, FaLightbulb } from "react-icons/fa";
import "../../../styles/components/Shopping/ShoppingCartTable.css";
import { ShoppingCartProduct, ShoppingCartProductInsert } from "../../../services/shopping/shoppingCartService";
import ProductSelectionModal from "../../Product/ProductSelectionModal";

interface ShoppingCartTableProps {
    products: ShoppingCartProduct[];
    onUpdateProduct: (product: ShoppingCartProduct, isAdvancedMode: boolean) => void;
    onRemoveProduct: (productId: number) => void;
    onAddProducts: (selectedProducts: ShoppingCartProductInsert[]) => void;
    isAdvancedMode: boolean;
    setIsAdvancedMode: (value: boolean) => void;
}

const ShoppingCartTable: React.FC<ShoppingCartTableProps> = ({
    products,
    onUpdateProduct,
    onRemoveProduct,
    onAddProducts,
    isAdvancedMode,
    setIsAdvancedMode
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
        let newValue: string | number =
            (editValues[product.id]?.[field] as string | number) ??
            (product[field] as string | number) ??
            (field === "purchasedUnit" ? "GRAM" : 0);

        let updatedProduct: ShoppingCartProduct = {
            ...product,
            [field]: newValue,
        };

        let convertedQuantity = updatedProduct.purchasedQuantity; // Mantém valor original para cálculos

        // ⚡ Se a unidade foi alterada, converter apenas para cálculos, mas sem mudar a unidade original
        if (field === "purchasedUnit") {
            switch (newValue) {
                case "GRAM":
                    convertedQuantity = product.purchasedQuantity / 1000; // Converte para kg para cálculo
                    break;
                case "MILLILITER":
                    convertedQuantity = product.purchasedQuantity / 1000; // Converte para L para cálculo
                    break;
                default:
                    convertedQuantity = product.purchasedQuantity;
            }
        }

        // ⚡ Atualizar os valores com base no campo alterado
        if (field === "purchasedQuantity") {
            updatedProduct.totalPrice =
                updatedProduct.unitPrice > 0
                    ? Number(formatBigDecimal(convertedQuantity * updatedProduct.unitPrice)) // 🔥 Converte para número
                    : 0; // Evita erro
        } else if (field === "unitPrice") {
            updatedProduct.totalPrice =
                convertedQuantity > 0
                    ? Number(formatBigDecimal(convertedQuantity * updatedProduct.unitPrice)) // 🔥 Converte para número
                    : 0; // Evita erro
        } else if (field === "totalPrice") {
            updatedProduct.unitPrice =
                convertedQuantity > 0
                    ? Number(formatBigDecimal(updatedProduct.totalPrice / convertedQuantity)) // 🔥 Converte para número
                    : 0; // Evita erro
        }

        // Atualiza o estado do produto no carrinho
        onUpdateProduct(updatedProduct , isAdvancedMode);

        // Remove o valor editado temporariamente para limpar o input
        setEditValues((prev) => {
            const newValues = { ...prev };
            delete newValues[product.id];
            return newValues;
        });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, product: ShoppingCartProduct, field: string) => {
        const { value } = e.target;
        setEditValues((prev) => ({
            ...prev,
            [product.id]: {
                ...prev[product.id],
                [field]: value,
            },
        }));
    };

    const totalPrice = products.reduce((sum, product) => sum + (product.totalPrice || 0), 0);

    return (
        <div>
            {/* Switch entre Modo Simples e Avançado */}
            <div className="cart-header">
                <label className="switch">
                    <input type="checkbox" checked={isAdvancedMode} onChange={() => setIsAdvancedMode(!isAdvancedMode)} />
                    <span className="slider">
                        <span className="switch-text">{isAdvancedMode ? "Avançado" : "Simples"}</span>
                    </span>
                </label>
            </div>

            <table className="shopping-cart-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Nome do Produto</th>
                        <th>Quantidade Planejada</th>
                        <th>Quantidade no Carrinho</th>
                        <th>Unidade de Medida</th>
                        {isAdvancedMode && <th>Preço Unitário (R$ p/ Kg/L)</th>}
                        {isAdvancedMode && <th>Preço Total (R$)</th>}
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
                                <select
                                    value={String(editValues[product.id]?.purchasedUnit ?? product.purchasedUnit ?? product.plannedUnit ?? "GRAM")}
                                    onChange={(e) => handleSelectChange(e, product, "purchasedUnit")}
                                    onBlur={() => handleEditBlur(product, "purchasedUnit")}
                                >
                                    <option value="Quilo">K</option>
                                    <option value="Quilograma">Kg</option>
                                    <option value="Grama">g</option>
                                    <option value="Mililitro">ml</option>
                                    <option value="Litro">L</option>
                                    <option value="Unidade">Unidade</option>
                                </select>
                            </td>
                            {isAdvancedMode && (
                                <td>
                                    <input
                                        type="number"
                                        value={editValues[product.id]?.unitPrice ?? product.unitPrice}
                                        onChange={(e) => handleEditChange(e, product, "unitPrice")}
                                        onBlur={() => handleEditBlur(product, "unitPrice")}
                                        step="0.01"
                                    />
                                </td>
                            )}
                            {isAdvancedMode && (
                                <td>
                                    <input
                                        type="number"
                                        value={editValues[product.id]?.totalPrice ?? product.totalPrice}
                                        onChange={(e) => handleEditChange(e, product, "totalPrice")}
                                        onBlur={() => handleEditBlur(product, "totalPrice")}
                                        step="0.01"
                                    />
                                </td>
                            )}
                            <td>
                                {product.plannedQuantity == null && (
                                    <button className="remove-button" onClick={() => onRemoveProduct(product.id)}>
                                        <FaTrash />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    {/* Botão para adicionar itens */}
                    <tr>
                        <td colSpan={isAdvancedMode ? 8 : 6} style={{ fontWeight: "bold", textAlign: "center" }}>
                            <button className="add-products-button" onClick={() => setIsModalOpen(true)}>
                                <FaPlus /> Adicionar Itens
                            </button>
                        </td>
                    </tr>
                    {isAdvancedMode && (
                        <tr>
                            <td colSpan={6} style={{ fontWeight: "bold", textAlign: "right" }}>Total:</td>
                            <td style={{ fontWeight: "bold" }}>{totalPrice.toFixed(2)}</td>
                            <td></td>
                        </tr>
                    )}
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
