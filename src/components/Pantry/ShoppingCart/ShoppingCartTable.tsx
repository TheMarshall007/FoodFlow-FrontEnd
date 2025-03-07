import React, { useState } from "react";
import { FaTrash, FaPlus, FaClipboard, FaLightbulb } from "react-icons/fa";
import "../../../styles/components/Shopping/ShoppingCartTable.css";
import { ShoppingCartProduct, ShoppingCartProductInsert } from "../../../services/shopping/shoppingCartService";
import ProductSelectionModal from "../../Product/ProductSelectionModal";

interface ShoppingCartTableProps {
    products: ShoppingCartProduct[];
    onUpdateProduct: (product: ShoppingCartProduct, isAdvancedMode: boolean) => void;
    onUpdateProductList: (product: ShoppingCartProduct, isAdvancedMode: boolean) => void;
    onRemoveProduct: (productId: number) => void;
    onAddProducts: (selectedProducts: ShoppingCartProductInsert[]) => void;
    isAdvancedMode: boolean;
    setIsAdvancedMode: (value: boolean) => void;
}

const ShoppingCartTable: React.FC<ShoppingCartTableProps> = ({
    products,
    onUpdateProduct,
    onUpdateProductList,
    onRemoveProduct,
    onAddProducts,
    isAdvancedMode,
    setIsAdvancedMode
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editValues, setEditValues] = useState<{ [key: number]: Partial<ShoppingCartProduct> }>({});

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
            (product[field] as string | number) ?? 0;
    
        let updatedProduct: ShoppingCartProduct = {
            ...product,
            [field]: newValue,
        };
    
        // Obtendo os valores antes do cálculo
        const purchasedQuantity = Number(updatedProduct.purchasedQuantity) || 0;
        const purchasedUnit = String(updatedProduct.purchasedUnit) || "Unidade";
        const unitPrice = Number(updatedProduct.unitPrice) || 0;
        const totalPrice = Number(updatedProduct.totalPrice) || 0;
        const productUnit = String(product.systemProduct.unit) || "Unidade";
        const productQuantity = Number(product.systemProduct.quantityPerUnit) || 1;
    
        // ⚡ Chamando `calculatePrices` para calcular os valores corretos
        const { totalPrice: newTotalPrice, unitPrice: newUnitPrice } = calculatePrices(
            purchasedQuantity,
            purchasedUnit,
            unitPrice,
            totalPrice,
            productUnit,
            productQuantity
        );
    
        // Atualiza os valores calculados no produto atualizado
        updatedProduct.totalPrice = newTotalPrice;
        updatedProduct.unitPrice = newUnitPrice;
    
        // Atualiza o estado do produto no carrinho
        onUpdateProductList(updatedProduct, isAdvancedMode);
    
        // Remove o valor editado temporariamente para limpar o input
        setEditValues((prev) => {
            const newValues = { ...prev };
            delete newValues[product.id];
            return newValues;
        });
    };    

    const calculatePrices = (
        purchasedQuantity: number,
        purchasedUnit: string,
        unitPrice: number,
        totalPrice: number,
        productUnit: string,
        productQuantity: number
    ) => {
        let newTotalPrice = totalPrice;
        let newUnitPrice = unitPrice;
    
        // Se unidade no carrinho for Kg ou L → Multiplicar diretamente
        if (purchasedUnit === "Kg" || purchasedUnit === "L") {
            newTotalPrice = unitPrice * purchasedQuantity;
        }
        // Se unidade no carrinho for g ou ml → Dividir o preço por 1000
        else if (purchasedUnit === "g" || purchasedUnit === "ml") {
            newTotalPrice = (unitPrice / 1000) * purchasedQuantity;
        }
        // Se unidade no carrinho for UNIDADE e o produto for vendido por Kg ou L
        else if (purchasedUnit === "Unidade" && (productUnit === "Kg" || productUnit === "L")) {
            newTotalPrice = productQuantity * purchasedQuantity * unitPrice;
        }
        // Se unidade no carrinho for UNIDADE e o produto for vendido por g ou ml
        else if (purchasedUnit === "Unidade" && (productUnit === "g" || productUnit === "ml")) {
            newTotalPrice = (productQuantity * purchasedQuantity / 1000) * unitPrice;
        }
        // Se unidade no carrinho for UNIDADE e o produto também for UNIDADE
        else if (purchasedUnit === "Unidade" && productUnit === "Unidade") {
            newUnitPrice = newTotalPrice / purchasedQuantity;
        }
    
        return {
            totalPrice: Number(newTotalPrice.toFixed(2)),
            unitPrice: Number(newUnitPrice.toFixed(2))
        };
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

    const getAllowedUnits = (productUnit: string | undefined): string[] => {
        if (!productUnit) return ["Unidade", "g", "Kg", "ml", "L"];

        const unitMap: Record<string, string[]> = {
            "g": ["g", "Kg", "Unidade"],     // Ex: Frutas, legumes, temperos
            "Kg": ["g", "Kg", "Unidade"],    // Ex: Carnes, arroz, frutas vendidas por Kg
            "ml": ["ml", "L", "Unidade"],    // Ex: Óleos, leite em embalagens menores
            "L": ["ml", "L", "Unidade"],     // Ex: Bebidas em garrafas maiores
            "Unidade": ["Unidade", "g", "Kg", "ml", "L"], // Ex: Ovos, maçãs, caixas de leite
        };

        return unitMap[productUnit] || ["Unidade"];
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
                        {isAdvancedMode && <th>Preço Total</th>}
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
                                    {getAllowedUnits(String(product.systemProduct.unit) || "").map((unit) => (
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
                                    <span>R$ {(editValues[product.id]?.totalPrice ?? product.totalPrice).toFixed(2)}</span>
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
                                productGtin: product.gtin,
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
