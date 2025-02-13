import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";
import "../../../styles/components/Shopping/ShoppingCartProductCard.css"
import { ShoppingCartProduct } from "../../../services/shopping/shoppingCartService";
interface ShoppingCartProductCardProps {
    product: ShoppingCartProduct;
    onUpdateQuantity: (data: ShoppingCartProduct) => void;
    onRemoveProduct: (productId: number) => void;
}

const ShoppingCartProductCard: React.FC<ShoppingCartProductCardProps> = ({ product, onUpdateQuantity, onRemoveProduct }) => {
    const [purchasedQuantity, setCartQuantity] = useState(product.purchasedQuantity);
    const [totalPrice, setPrice] = useState(product.totalPrice);

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuantity = Math.max(0, parseInt(e.target.value) || 0);
        setCartQuantity(newQuantity);
        onUpdateQuantity({
            id: product.id, 
            systemProduct: product.systemProduct, 
            plannedQuantity: product.plannedQuantity,
            plannedUnit: product.plannedUnit,
            purchasedQuantity: newQuantity, 
            purchasedUnit: product.purchasedUnit,
            unitPrice: product.unitPrice,
            totalPrice,
        });
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPrice = parseFloat(e.target.value) || 0;
        setPrice(newPrice);
        onUpdateQuantity({
            id: product.id, 
            systemProduct: product.systemProduct, 
            plannedQuantity: product.plannedQuantity,
            plannedUnit: product.plannedUnit,
            purchasedQuantity: product.purchasedQuantity, 
            purchasedUnit: product.purchasedUnit,
            unitPrice: product.unitPrice,
            totalPrice: newPrice,
        });
    };

    return (
        <div className="shopping-cart-product-card">
            <p className="product-name">{product.systemProduct.brand}</p>

            <div className="product-controls">
                <label>Quantidade:</label>
                <input
                    type="number"
                    value={purchasedQuantity}
                    onChange={handleQuantityChange}
                    min="0"
                />
            </div>

            <div className="product-controls">
                <label>Preço:</label>
                <input
                    type="number"
                    step="0.01"
                    value={totalPrice}
                    onChange={handlePriceChange}
                />
            </div>

            <button className="remove-button" onClick={() => onRemoveProduct(product.id)}>
                <FaTrash />
            </button>
        </div>
    );
};

export default ShoppingCartProductCard;
