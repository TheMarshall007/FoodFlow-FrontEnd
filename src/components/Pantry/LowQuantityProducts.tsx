// src/components/Pantry/LowQuantityProducts.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchLowQuantityProducts } from '../../services/pantry/pantryService';

interface LowQuantityProductType {
    id: number;
    name: string;
    quantity: number;
}

const LowQuantityProducts: React.FC = () => {
    const { pantryId } = useParams<{ pantryId: string }>();
    const [lowQuantityProducts, setLowQuantityProducts] = useState<LowQuantityProductType[]>([]);
    const threshold = 5; // ou defina como variável

    useEffect(() => {
        async function loadLowQuantityProducts() {
            if (pantryId) {
                const data = await fetchLowQuantityProducts(parseInt(pantryId), threshold);
                setLowQuantityProducts(data);
            }
        }

        loadLowQuantityProducts();
    }, [pantryId, threshold]);

    return (
        <div>
            <h2>Itens com Baixa Quantidade</h2>
            <ul>
                {lowQuantityProducts?.map((item) => (
                    <li key={item.id}>
                        {item.name} - {item.quantity}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LowQuantityProducts;
