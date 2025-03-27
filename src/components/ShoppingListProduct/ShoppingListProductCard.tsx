import { useState } from "react";
import { ShoppingListProduct } from "../../services/shopping/shoppingListService";
import { FaTrash } from "react-icons/fa";
import styles from "../../styles/components/Shopping/ShoppingListProductCard.module.css";

const ShoppingListProductCard: React.FC<{
    product: ShoppingListProduct;
    onUpdateQuantity: (productId: number, newQuantity: number) => void;
    onRemoveProduct: (productId: number) => void;
    isNew?: boolean
}> = ({ product, onUpdateQuantity, onRemoveProduct, isNew }) => {
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
        <div className={styles.shoppingListProductCard}>
            <p className={styles.productName}>
                {product.systemProduct?.name ?? "Produto"} ({product.systemProduct.brand}) {isNew && "(New)"}
            </p>
            <p className={styles.productDetails}>
                Quantidade por unidade: {product.systemProduct.quantityPerUnit} {product.systemProduct.unit}
            </p>
            <div className={styles.productQuantityControl}>
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
                    className={styles.quantityInput}
                />
                <button onClick={handleIncrement}>+</button>
                <button
                    className={styles.removeProductButton}
                    onClick={() => onRemoveProduct(product.id)}
                >
                    <FaTrash size={16} />
                </button>
            </div>
        </div>
    );
};

export default ShoppingListProductCard;
