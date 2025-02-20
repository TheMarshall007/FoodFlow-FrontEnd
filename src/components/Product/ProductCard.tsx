import React from "react";
import "../../styles/components/Product/ProductCard.css";
import { Product } from "../../services/product/productService";

interface ProductCardProps {
    product: Product;
    actions?: React.ReactNode;
    isSelected?: boolean; // Indica se o item está selecionado (para carrinho ou lista de compras)
    isLowQuantity?: boolean; // Indica se o item está quase acabando
}

const ProductCard: React.FC<ProductCardProps> = ({ product, actions, isSelected = false, isLowQuantity = false }) => {
    return (
        <div className={`product-card ${isSelected ? "selected" : ""} ${isLowQuantity ? "low-quantity" : ""}`}>
            <h3>
                {product.variety?.ingredient?.name ?? "Produto Desconhecido"} {product.variety?.name ?? "Sem Variedade"}{" "}
                {product.quantityPerUnit}{product.unit} - ({product.brand})
            </h3>
            <p></p>
            {actions && <div className="product-actions">{actions}</div>}
        </div>
    );
};

export default ProductCard;
