import React, { useState } from 'react';
import '../../../styles/components/ItemSelection/ItemSelectionModal.css'
import { ShoppingListItem } from '../../../services/shopping/shoppingListService';

interface Item {
    id: number;
    name: string;
}

interface ItemSelectionModalProps {
    availableItems: Item[];
    onClose: () => void;
    onConfirm: (selectedItems: ShoppingListItem[]) => void;
}

const ItemSelectionModal: React.FC<ItemSelectionModalProps> = ({
    availableItems,
    onClose,
    onConfirm,
}) => {
    const [selectedItems, setSelectedItems] = useState<ShoppingListItem[]>([]);

    const toggleItemSelection = (item: Item) => {
        setSelectedItems((prev) =>
            prev.some((selected) => selected.id === item.id)
                ? prev.filter((selected) => selected.id !== item.id)
                : [...prev, { ...item, quantity: 1, ingredientId: item.id, category: 'Outros' }]
        );
        
        
    };

    const handleConfirm = () => {
        onConfirm(selectedItems);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Selecione os Itens</h2>
                <div className="item-cards">
                    {availableItems.map((item) => (
                        <div
                            key={item.id}
                            className={`item-card ${
                                selectedItems.some(
                                    (selected) => selected.id === item.id
                                )
                                    ? 'selected'
                                    : ''
                            }`}
                            onClick={() => toggleItemSelection(item)}
                        >
                            {item.name}
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

export default ItemSelectionModal;
