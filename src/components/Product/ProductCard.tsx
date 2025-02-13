import React from "react";
import "../../styles/components/Product/ProductCard.css";
import { Product } from "../../services/product/productService";

interface ProductCardProps {
    product: Product;
    actions?: React.ReactNode; // Permite passar botões personalizados
    isSelected?: boolean; // Indica se o produto está selecionado
}

const ProductCard: React.FC<ProductCardProps> = ({ product, actions, isSelected = false }) => {
    console.log(isSelected)
    return (
        <div className={`product-card ${isSelected ? "selected" : ""}`}>
            <h3>
                {product.variety?.ingredient?.name ?? "Produto Desconhecido"} -{" "}
                {product.variety?.name ?? "Sem Variedade"} ({product.brand})
            </h3>
            <p>{product.quantityPerUnit} {product.unit}</p>
            {actions && <div className="product-actions">{actions}</div>}
        </div>
    );
};

export default ProductCard;
