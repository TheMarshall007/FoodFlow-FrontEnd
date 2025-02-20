import React from 'react';

interface ShoppingListProductProps {
    id: number;
    name: string;
    quantityPlanned: number;
    onRemove: (itemId: number) => void;
}

const ShoppingListProduct: React.FC<ShoppingListProductProps> = ({ id, name, quantityPlanned, onRemove }) => {
    return (
        <div className="shopping-list-item">
            <p><strong>{name}</strong></p>
            <p>Quantidade Planejada: {quantityPlanned}</p>
            <button className="remove-product-button" onClick={() => onRemove(id)}>
                Remover
            </button>
        </div>
    );
};

export default ShoppingListProduct;
