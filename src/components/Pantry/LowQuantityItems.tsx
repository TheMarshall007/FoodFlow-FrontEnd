// src/components/Pantry/LowQuantityItems.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchLowQuantityItems } from '../../services/pantry/pantryService';

interface LowQuantityItemType {
    id: number;
    name: string;
    quantity: number;
}

const LowQuantityItems: React.FC = () => {
    const { pantryId } = useParams<{ pantryId: string }>();
    const [lowQuantityItems, setLowQuantityItems] = useState<LowQuantityItemType[]>([]);
    const threshold = 5; // ou defina como variável

    useEffect(() => {
        async function loadLowQuantityItems() {
            if (pantryId) {
                const data = await fetchLowQuantityItems(parseInt(pantryId), threshold);
                setLowQuantityItems(data);
            }
        }

        loadLowQuantityItems();
    }, [pantryId, threshold]);

    return (
        <div>
            <h2>Itens com Baixa Quantidade</h2>
            <ul>
                {lowQuantityItems?.map((item) => (
                    <li key={item.id}>
                        {item.name} - {item.quantity}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LowQuantityItems;
