import React from "react";
import "../../styles/components/Product/ProductCard.css";
import { Product, ProductDTOResponseSimple } from "../../services/product/productService";

interface ProductCardProps {
    product: Product | ProductDTOResponseSimple;
    actions?: React.ReactNode;
    isSelected?: boolean; // Indicates if the item is selected (for cart or shopping list)
    isLowQuantity?: boolean; // Indicates if the item is running low
    isNew?: boolean; //Indicates if the product is new
}

const ProductCard: React.FC<ProductCardProps> = ({ product, actions, isSelected = false, isLowQuantity = false, isNew = false }) => {
    const productName = (product as Product)?.name ?? (product as ProductDTOResponseSimple).name ?? "Unknown Product";
    const productBrand = (product as Product).brand ?? "";

    return (
        <div className={`product-card ${isSelected ? "selected" : ""} ${isLowQuantity ? "low-quantity" : ""}`}>
            <h3>
                {productName} {isNew && "(New)"} {productBrand && `(${productBrand})`}
            </h3>
            {/* Conditionally display quantity and unit if the product is of type Product */}
            { (product as Product).quantityPerUnit !== undefined && (
                <p>
                   {(product as Product).quantityPerUnit} {(product as Product).unit}
                </p>
            )}
            {actions && <div className="product-actions">{actions}</div>}
        </div>
    );
};

export default ProductCard;
