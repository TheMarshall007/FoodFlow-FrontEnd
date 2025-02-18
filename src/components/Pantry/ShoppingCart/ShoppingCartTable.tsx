import React, { useState } from "react";
import { FaTrash, FaPlus, FaClipboard, FaLightbulb } from "react-icons/fa";
import "../../../styles/components/Shopping/ShoppingCartTable.css";
import { ShoppingCartProduct, ShoppingCartProductInsert } from "../../../services/shopping/shoppingCartService";
import ProductSelectionModal from "../../Product/ProductSelectionModal";
import { UnitOfMeasure } from "../../../services/product/productService";

interface ShoppingCartTableProps {
    products: ShoppingCartProduct[];
    onUpdateProduct: (product: ShoppingCartProduct, isAdvancedMode: boolean) => void;
    onUpdateProductList: (product: ShoppingCartProduct[], isAdvancedMode: boolean) => void;
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
            (field === "purchasedUnit" ? "g" : 0);
    
        let updatedProduct: ShoppingCartProduct = {
            ...product,
            [field]: newValue,
        };
    
        let purchasedQuantity = Number(updatedProduct.purchasedQuantity) || 0;
        let unitPrice = Number(updatedProduct.unitPrice) || 0;
        let totalPrice = Number(updatedProduct.totalPrice) || 0;
        let purchasedUnit = updatedProduct.purchasedUnit as UnitOfMeasure;
        let productUnit = product.systemProduct.unit as UnitOfMeasure;
        let productQuantity = Number(product.systemProduct.quantityPerUnit) || 1;
    
        // 🔹 Aplicação da lógica de cálculo do backend no frontend
        if (purchasedUnit === "Kg" || purchasedUnit === "L") {
            totalPrice = unitPrice * purchasedQuantity;
        } else if (purchasedUnit === "g" || purchasedUnit === "ml") {
            totalPrice = (unitPrice / 1000) * purchasedQuantity;
        } else if (purchasedUnit === "unit" && (productUnit === "Kg" || productUnit === "L")) {
            totalPrice = productQuantity * purchasedQuantity * unitPrice;
        } else if (purchasedUnit === "unit" && (productUnit === "g" || productUnit === "ml")) {
            totalPrice = (productQuantity * purchasedQuantity / 1000) * unitPrice;
        } else if (purchasedUnit === "unit" && productUnit === "unit") {
            unitPrice = totalPrice / purchasedQuantity;
        }
    
        updatedProduct.totalPrice = Number(formatBigDecimal(totalPrice));
        updatedProduct.unitPrice = Number(formatBigDecimal(unitPrice));
    
        // 🔹 Atualiza o estado do produto no carrinho
        onUpdateProduct(updatedProduct, isAdvancedMode);
    
        // 🔹 Remove o valor editado temporariamente para limpar o input
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

    const getAllowedUnits = (plannedUnit: string | undefined): string[] => {
        if (!plannedUnit) return ["Unidade", "g", "Kg", "ml", "L"];

        const unitMap: Record<string, string[]> = {
            "g": ["g", "Kg", "Unidade"],     // Ex: Frutas, legumes, temperos
            "Kg": ["g", "Kg", "Unidade"],    // Ex: Carnes, arroz, frutas vendidas por Kg
            "ml": ["ml", "L", "Unidade"],    // Ex: Óleos, leite em embalagens menores
            "L": ["ml", "L", "Unidade"],     // Ex: Bebidas em garrafas maiores
            "Unidade": ["Unidade", "g", "Kg", "ml", "L"], // Ex: Ovos, maçãs, caixas de leite
        };

        return unitMap[plannedUnit] || ["Unidade"];
    };

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
                        <th>Quantidade Planejada</th>
                        <th>Produto</th>
                        <th>Quantidade no Carrinho</th>
                        <th>Unidade de Medida</th>
                        {isAdvancedMode && <th>Preço por Kg, L ou Unidade</th>}
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
                                {product.plannedQuantity !== null ? `${product.plannedQuantity} ${product.plannedUnit}` : ""}
                            </td>
                            <td>
                                {product?.systemProduct?.variety?.ingredient?.name ?? "Produto Desconhecido"}{" "}
                                {product?.systemProduct?.variety?.name ?? "Variedade Desconhecida"}{" "}
                                {product?.systemProduct.quantityPerUnit} {product?.systemProduct.unit} -
                                ({product?.systemProduct?.brand ?? "Marca Desconhecida"})
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
                                    value={String(editValues[product.id]?.purchasedUnit ?? product.purchasedUnit ?? product.plannedUnit ?? "Unidade")}
                                    onChange={(e) => handleSelectChange(e, product, "purchasedUnit")}
                                    onBlur={() => handleEditBlur(product, "purchasedUnit")}
                                >
                                    {getAllowedUnits(String(product.plannedUnit) || "").map((unit) => (
                                        <option key={unit} value={unit}>
                                            {unit} {unit === "Unidade" && product.systemProduct.quantityPerUnit ? `(${product.systemProduct.quantityPerUnit} ${product.systemProduct.unit})` : ""}
                                        </option>
                                    ))}
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
                            <td style={{ fontWeight: "bold" }}>R$ {totalPrice.toFixed(2)}</td>
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
