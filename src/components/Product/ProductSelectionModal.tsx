import React, { useState } from "react";
import "../../styles/components/Product/ProductSelectionModal.css";
import { Product } from "../../services/product/productService";
import ProductCard from "../Product/ProductCard";
import { useProduct } from "../../hooks/useProduct";

interface ProductSelectionModalProps {
    onClose: () => void;
    onConfirm: (selectedProducts: Product[]) => void;
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({ onClose, onConfirm }) => {
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const { state}  = useProduct()
    // Alterna a seleção do produto
    const toggleProductSelection = (product: Product) => {
        setSelectedProducts((prevSelected) =>
            prevSelected.some((p) => p.id === product.id)
                ? prevSelected.filter((p) => p.id !== product.id) // Remove se já estiver selecionado
                : [...prevSelected, product] // Adiciona se não estiver
        );
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Selecione os Produtos</h3>

                <div className="product-list">
                    {state.systemProduct.length === 0 ? (
                        <p>Nenhum produto encontrado.</p>
                    ) : (
                        state.systemProduct.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                isSelected={selectedProducts.some((p) => p.id === product.id)}
                                actions={
                                    <button onClick={() => toggleProductSelection(product)}>
                                        {selectedProducts.some((p) => p.id === product.id) ? "Remover" : "Selecionar"}
                                    </button>
                                }
                            />
                        ))
                    )}
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="cancel-button">Cancelar</button>
                    <button onClick={() => onConfirm(selectedProducts)} className="confirm-button">
                        Adicionar {selectedProducts.length} Itens
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductSelectionModal;
