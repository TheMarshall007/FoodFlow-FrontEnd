import { useState } from "react";
import { ShoppingListItem } from "../../services/shopping/shoppingListService";
import { FaTrash } from "react-icons/fa";

const ShoppingListItemCard: React.FC<{
    item: ShoppingListItem;
    onUpdateQuantity: (ingredientId: number, newQuantity: number) => void;
    onRemoveItem: (ingredientId: number) => void;
}> = ({ item, onUpdateQuantity, onRemoveItem }) => {
    const [inputValue, setInputValue] = useState(item.quantity);

    const handleDebouncedChange = (() => {
        let timeout: NodeJS.Timeout;
        return (value: number) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (value === 0) {
                    onRemoveItem(item.id);
                } else {
                    onUpdateQuantity(item.ingredientId, value);
                }
            }, 500); // Tempo de debounce (500ms)
        };
    })();

    const handleDecrement = () => {
        const newQuantity = Math.max(inputValue - 1, 0);
        setInputValue(newQuantity);
        if (newQuantity === 0) {
            onRemoveItem(item.id);
        } else {
            onUpdateQuantity(item.ingredientId, newQuantity);
        }
    };

    const handleIncrement = () => {
        const newQuantity = inputValue + 1;
        setInputValue(newQuantity);
        onUpdateQuantity(item.ingredientId, newQuantity);
    };

    return (
        <div className="shopping-list-item-card">
            <p className="item-name">{item.name || "Desconhecido"}</p>
            <div className="item-quantity-control">
                <button onClick={handleDecrement} disabled={inputValue <= 0}>
                    -
                </button>
                <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => {
                        const newQuantity = Math.max(parseInt(e.target.value) || 0, 0);
                        setInputValue(newQuantity);
                        handleDebouncedChange(newQuantity);
                    }}
                    className="quantity-input"
                />
                <button onClick={handleIncrement}>+</button>
                <button
                    className="remove-item-button"
                    onClick={() => onRemoveItem(item.id)}
                >
                    <FaTrash size={16} />
                </button>
            </div>
        </div>
    );
};

export default ShoppingListItemCard;
