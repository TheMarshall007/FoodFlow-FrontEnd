import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";
import "../../../styles/components/Shopping/ShoppingCartItemCard.css"
import { ShoppingCartItem } from "../../../services/shopping/shoppingCartService";
interface ShoppingCartItemCardProps {
    item: ShoppingCartItem;
    onUpdateQuantity: (data: ShoppingCartItem) => void;
    onRemoveItem: (itemId: number) => void;
}

const ShoppingCartItemCard: React.FC<ShoppingCartItemCardProps> = ({ item, onUpdateQuantity, onRemoveItem }) => {
    const [cartQuantity, setCartQuantity] = useState(item.cartQuantity);
    const [price, setPrice] = useState(item.price);

    const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuantity = Math.max(0, parseInt(e.target.value) || 0);
        setCartQuantity(newQuantity);
        onUpdateQuantity({ id: item.id, ingredient: item.ingredient, cartQuantity: newQuantity, price });
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPrice = parseFloat(e.target.value) || 0;
        setPrice(newPrice);
        onUpdateQuantity({ id: item.id, ingredient: item.ingredient, cartQuantity, price: newPrice });
    };

    return (
        <div className="shopping-cart-item-card">
            <p className="item-name">{item.ingredient.name}</p>

            <div className="item-controls">
                <label>Quantidade:</label>
                <input
                    type="number"
                    value={cartQuantity}
                    onChange={handleQuantityChange}
                    min="0"
                />
            </div>

            <div className="item-controls">
                <label>Preço:</label>
                <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={handlePriceChange}
                />
            </div>

            <button className="remove-button" onClick={() => onRemoveItem(item.id)}>
                <FaTrash />
            </button>
        </div>
    );
};

export default ShoppingCartItemCard;
