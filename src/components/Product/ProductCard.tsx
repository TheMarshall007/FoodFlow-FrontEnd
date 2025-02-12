import { useEffect, useState } from "react";
import { Product } from "../../services/product/productService";
import "../../styles/components/Product/ProductCard.css";
import { ShoppingListProductInsert } from "../../services/shopping/shoppingListService";

const ProductCard: React.FC<{
    product: Product;
    handleAddProductToShoppingList: (product: ShoppingListProductInsert) => void;
    onUpdateQuantity: (productId: number, newQuantity: number) => void;
    onRemoveProduct: (productId: number) => void;
    initialQuantity: number;
    shoppingListProductId: number;
}> = ({ product, handleAddProductToShoppingList, initialQuantity, shoppingListProductId, onUpdateQuantity, onRemoveProduct }) => {
    const [quantity, setQuantity] = useState(initialQuantity);

    
    useEffect(() => {
        setQuantity(initialQuantity);
    }, [initialQuantity]);

    const handleAddProduct = () => {
        setQuantity(1);
        handleAddProductToShoppingList({ productId: product.id, quantity: 1 });
    };

    const handleIncrease = () => {
        const newQuantity = quantity + 1;
        setQuantity(newQuantity);
        onUpdateQuantity(product.id, newQuantity);
    };

    const handleDecrease = () => {

        const newQuantity = Math.max(quantity - 1, 0);
        setQuantity(newQuantity);
        if (newQuantity === 0) {
            onRemoveProduct(shoppingListProductId);
        } else {
            onUpdateQuantity(product.id, newQuantity);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuantity = Math.max(parseInt(e.target.value) || 0, 0);
        setQuantity(newQuantity);
        handleDebouncedChange(newQuantity);
    };

    const handleDebouncedChange = (() => {
        let timeout: NodeJS.Timeout;
        return (value: number) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (value === 0) {
                    onRemoveProduct(shoppingListProductId);
                } else {
                    onUpdateQuantity(product.id, value);
                }
            }, 500); // Tempo de debounce (500ms)
        };
    })();

    return (
        <div className={`product-card ${quantity > 0 ? "added" : ""}`}>
            <h3>{product.brand}</h3>
            <p>Variedade: {product.variety?.name || "Sem variedade"}</p>
            <p>Quantidade: {product.quantityPerUnit} {product.unit}</p>

            {quantity === 0 ? (
                <button className="add-to-list-btn" onClick={handleAddProduct}>
                    Adicionar à Lista
                </button>
            ) : (
                <div className="quantity-controls">
                    <button className="decrease-btn" onClick={handleDecrease}>-</button>
                    <input
                        type="number"
                        value={quantity}
                        onChange={handleInputChange}
                        min="0"
                    />
                    <button className="increase-btn" onClick={handleIncrease}>+</button>
                </div>
            )}
        </div>
    );
};

export default ProductCard;
