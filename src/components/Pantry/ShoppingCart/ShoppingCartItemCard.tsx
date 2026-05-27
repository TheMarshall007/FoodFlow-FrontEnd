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
    const [purchasedQuantity, setPurchasedQuantity] = useState(product.purchasedQuantity);
    const [unitPrice, setUnitPrice] = useState(product.unitPrice);

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuantity = Math.max(0, parseInt(e.target.value) || 0);
        setPurchasedQuantity(newQuantity);
        onUpdateQuantity({
            ...product,
            purchasedQuantity: newQuantity,
            totalPrice: newQuantity * unitPrice
        });
    };

    const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPrice = parseFloat(e.target.value) || 0;
        setUnitPrice(newPrice);
        onUpdateQuantity({
            ...product,
            unitPrice: newPrice,
            totalPrice: purchasedQuantity * newPrice
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
                <label>Preço Unitário:</label>
                <input
                    type="number"
                    step="0.01"
                    value={unitPrice}
                    onChange={handleUnitPriceChange}
                />
            </div>

            <div className="product-controls">
                <label>Total Price:</label>
                <span>{(purchasedQuantity * unitPrice).toFixed(2)}</span>
            </div>

            <button className="remove-button" onClick={() => onRemoveProduct(product.id)}>
                <FaTrash />
            </button>
        </div>
    );
};

export default ShoppingCartProductCard;
