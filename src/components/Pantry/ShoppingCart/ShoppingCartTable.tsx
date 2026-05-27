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

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>, product: ShoppingCartProduct) => {
        const newQuantity = Math.max(0, parseInt(e.target.value) || 0);
        onUpdateProduct({
            ...product,
            purchasedQuantity: newQuantity,
            totalPrice: newQuantity * product.unitPrice
        });
    };

    const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>, product: ShoppingCartProduct) => {
        const newPrice = parseFloat(e.target.value) || 0;
        onUpdateProduct({
            ...product,
            unitPrice: newPrice,
            totalPrice: product.purchasedQuantity * newPrice
        });
    };

    const totalPrice = products.reduce((sum, product) => sum + (product.totalPrice || 0), 0);

    return (
        <div>
            <table className="shopping-cart-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Planned Quantity</th>
                        <th>Product Name</th>
                        <th>Quantity in Cart</th>
                        <th>Unit of Measure</th>
                        <th>Price per Unit</th>
                        <th>Total Price</th>
                        <th>Actions</th>
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
                                {product.systemProduct.name ?? "Unknown Product"} ({product.systemProduct.brand})
                                {" "}
                                {product.systemProduct.quantityPerUnit} {product.systemProduct.unit}
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value={product.purchasedQuantity}
                                    onChange={(e) => handleQuantityChange(e, product)}
                                    min="0"
                                />
                            </td>
                            <td>
                                <select
                                    value={String(product.purchasedUnit ?? product.plannedUnit ?? "Unidade")}
                                    disabled // Assuming unit cannot be changed for now
                                >
                                    <option value="Unidade">Unidade</option>
                                    <option value="g">g</option>
                                    <option value="Kg">Kg</option>
                                    <option value="ml">ml</option>
                                    <option value="L">L</option>
                                </select>
                            </td>

                            <td>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={product.unitPrice}
                                    onChange={(e) => handleUnitPriceChange(e, product)}
                                />
                            </td>

                            <td>
                                <span>R$ {product.totalPrice.toFixed(2)}</span>
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
                    {/* Botão para adicionar itens */}
                    <tr>
                        <td colSpan={8} style={{ fontWeight: "bold", textAlign: "center" }}>
                            <button className="add-products-button" onClick={() => setIsModalOpen(true)}>
                                <FaPlus /> Add Items
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={6} style={{ fontWeight: "bold", textAlign: "right" }}>Total:</td>
                        <td style={{ fontWeight: "bold" }}>{totalPrice.toFixed(2)}</td>
                        <td></td>
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
