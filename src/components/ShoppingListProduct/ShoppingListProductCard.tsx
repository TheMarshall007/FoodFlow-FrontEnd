import { useState } from "react";
import { ShoppingListProduct } from "../../services/shopping/shoppingListService";
import { FaTrash } from "react-icons/fa";

const ShoppingListProductCard: React.FC<{
    product: ShoppingListProduct;
    onUpdateQuantity: (productId: number, newQuantity: number) => void;
    onRemoveProduct: (productId: number) => void;
}> = ({ product, onUpdateQuantity, onRemoveProduct }) => {
    const [inputValue, setInputValue] = useState(product.plannedQuantity);

    const handleDebouncedChange = (() => {
        let timeout: NodeJS.Timeout;
        return (value: number) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (value === 0) {
                    onRemoveProduct(product.id);
                } else {
                    onUpdateQuantity(product.id, value);
                }
            }, 500);
        };
    })();

    const handleDecrement = () => {
        const newQuantity = Math.max(inputValue - 1, 0);
        setInputValue(newQuantity);
        if (newQuantity === 0) {
            onRemoveProduct(product.id);
        } else {
            onUpdateQuantity(product.id, newQuantity);
        }
    };

    const handleIncrement = () => {
        const newQuantity = inputValue + 1;
        setInputValue(newQuantity);
        onUpdateQuantity(product.id, newQuantity);
    };

    return (
        <div className="shopping-list-product-card">
            <p className="product-name">
                {product.systemProduct.variety?.ingredient?.name ?? "Produto"} -{" "}
                {product.systemProduct.variety?.name ?? "Variedade Desconhecida"} ({product.systemProduct.brand})
            </p>
            <p className="product-details">
                Quantidade por unidade: {product.systemProduct.quantityPerUnit} {product.systemProduct.unit}
            </p>
            <div className="product-quantity-control">
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
                    className="remove-product-button"
                    onClick={() => onRemoveProduct(product.id)}
                >
                    <FaTrash size={16} />
                </button>
            </div>
        </div>
    );
};

export default ShoppingListProductCard;
