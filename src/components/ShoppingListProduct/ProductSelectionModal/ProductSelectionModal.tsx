import React, { useState } from 'react';
import '../../../styles/components/ProductSelection/ProductSelectionModal.css'
import { ShoppingListProduct } from '../../../services/shopping/shoppingListService';

interface Product {
    id: number;
    name: string;
}

interface ProductSelectionModalProps {
    availableProducts: Product[];
    onClose: () => void;
    onConfirm: (selectedProducts: ShoppingListProduct[]) => void;
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
    availableProducts,
    onClose,
    onConfirm,
}) => {
    const [selectedProducts, setSelectedProducts] = useState<ShoppingListProduct[]>([]);

    const toggleProductSelection = (product: Product) => {
        setSelectedProducts((prev) =>
            prev.some((selected) => selected.id === product.id)
                ? prev.filter((selected) => selected.id !== product.id)
                : [...prev, { ...product, quantity: 1, productId: product.id, category: 'Outros' }]
        );
        
        
    };

    const handleConfirm = () => {
        onConfirm(selectedProducts);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Selecione os Itens</h2>
                <div className="product-cards">
                    {availableProducts.map((product) => (
                        <div
                            key={product.id}
                            className={`product-card ${
                                selectedProducts.some(
                                    (selected) => selected.id === product.id
                                )
                                    ? 'selected'
                                    : ''
                            }`}
                            onClick={() => toggleProductSelection(product)}
                        >
                            {product.name}
                        </div>
                    ))}
                </div>
                <div className="modal-buttons">
                    <button className="confirm-button" onClick={handleConfirm}>
                        Confirmar
                    </button>
                    <button className="cancel-button" onClick={onClose}>
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductSelectionModal;
