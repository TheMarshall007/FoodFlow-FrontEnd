import React from 'react';

interface ShoppingListItemProps {
    id: number;
    name: string;
    quantityPlanned: number;
    onRemove: (itemId: number) => void;
}

const ShoppingListItem: React.FC<ShoppingListItemProps> = ({ id, name, quantityPlanned, onRemove }) => {
    return (
        <div className="shopping-list-item">
            <p><strong>{name}</strong></p>
            <p>Quantidade Planejada: {quantityPlanned}</p>
            <button className="remove-item-button" onClick={() => onRemove(id)}>
                Remover
            </button>
        </div>
    );
};

export default ShoppingListItem;
