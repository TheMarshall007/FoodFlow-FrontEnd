import React, { useState } from 'react';
import { reduceItemQuantity } from '../../../services/inventoryService';

interface InventoryItemType {
    id: number;
    name: string;
    quantity: number;
}

interface InventoryItemProps {
    item: InventoryItemType;
}

const InventoryItem: React.FC<InventoryItemProps> = ({ item }) => {
    const [quantity, setQuantity] = useState(item.quantity);

    const handleReduceQuantity = async () => {
        const newQuantity = 1; // Quantidade a ser reduzida (exemplo)
        const updatedItem = await reduceItemQuantity(item.id, item.id, newQuantity);
        setQuantity(updatedItem.quantity);
    };

    return (
        <li>
            {item.name} - {quantity} unidades
            <button onClick={handleReduceQuantity}>Reduzir</button>
        </li>
    );
};

export default InventoryItem;
