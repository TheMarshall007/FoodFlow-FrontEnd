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
            (field === "purchasedUnit" ? "g" : 0);

        let updatedProduct: ShoppingCartProduct = {
            ...product,
            [field]: newValue,
        };

        /*
        // 🔹 Código de cálculo removido para ser feito no backend
        let convertedQuantity = Number(updatedProduct.purchasedQuantity) || 0;
    
        // 🔹 Definição explícita do tipo de unidade
        type UnitType = "g" | "Kg" | "ml" | "L" | "unit";
    
        // 🔹 Mapeamento de conversão entre unidades
        const conversionFactors: Record<UnitType, Record<UnitType, number>> = {
            g:   { g: 1, Kg: 1 / 1000, ml: 0, L: 0, unit: 0 },
            Kg:  { g: 1000, Kg: 1, ml: 0, L: 0, unit: 0 },
            ml:  { g: 0, Kg: 0, ml: 1, L: 1 / 1000, unit: 0 },
            L:   { g: 0, Kg: 0, ml: 1000, L: 1, unit: 0 },
            unit: { g: 0, Kg: 0, ml: 0, L: 1, unit: 1 }
        };
    
        if (field === "purchasedUnit" && product.purchasedUnit !== newValue) {
            const prevUnit = product.purchasedUnit as UnitType;
            const newUnit = newValue as UnitType;
    
            if (conversionFactors[prevUnit] && conversionFactors[prevUnit][newUnit] !== undefined) {
                convertedQuantity *= conversionFactors[prevUnit][newUnit];
            }
        }
    
        if (field === "purchasedQuantity" || field === "purchasedUnit") {
            updatedProduct.totalPrice = updatedProduct.unitPrice > 0
                ? Number(formatBigDecimal(convertedQuantity * updatedProduct.unitPrice))
                : 0;
        } else if (field === "unitPrice") {
            updatedProduct.totalPrice = convertedQuantity > 0
                ? Number(formatBigDecimal(convertedQuantity * updatedProduct.unitPrice))
                : 0;
        } else if (field === "totalPrice") {
            updatedProduct.unitPrice = convertedQuantity > 0
                ? Number(formatBigDecimal(updatedProduct.totalPrice / convertedQuantity))
                : 0;
        }
        */

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

    // Função para formatar o valor com "R$" automaticamente
const formatCurrency = (value: string) => {
    // Remove tudo que não seja número ou ponto decimal
    let numericValue = value.replace(/[^\d,]/g, "");

    // Substitui ',' por '.' para garantir o formato decimal correto
    numericValue = numericValue.replace(",", ".");

    // Converte para número e volta para string formatada com 2 casas decimais
    let formattedValue = parseFloat(numericValue).toFixed(2);

    // Retorna no formato "R$ 99,99"
    return isNaN(parseFloat(formattedValue)) ? "R$ 0,00" : `R$ ${formattedValue}`;
};

// Função para remover "R$" e converter para número antes de salvar
const parseCurrency = (value: string) => {
    return parseFloat(value.replace(/[^\d,]/g, "").replace(",", "."));
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
                        <th>Nome do Produto</th>
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
