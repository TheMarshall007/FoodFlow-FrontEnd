// src/components/Inventory/InventoryList.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchInventoryByUser } from '../../../services/inventoryService';
import InventoryItem from './InventoryItem';

interface InventoryItemType {
    id: number;
    name: string;
    quantity: number;
}

const InventoryList: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [inventoryItems, setInventoryItems] = useState<InventoryItemType[]>([]);
    useEffect(() => {
        async function loadInventory() {
            if (userId) {
                const data = await fetchInventoryByUser(parseInt(userId));
                setInventoryItems(data);
            }
        }

        loadInventory();
    }, [userId]);

    return (
        <div>
            <h2>Inventário</h2>
            <ul>
                {inventoryItems.map((item) => (
                    <InventoryItem key={item.id} item={item} />
                ))}
            </ul>
        </div>
    );
};

export default InventoryList;
