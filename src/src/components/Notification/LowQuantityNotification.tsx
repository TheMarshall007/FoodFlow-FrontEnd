import React from 'react';

interface LowQuantityNotificationProps {
    lowQuantityItems: { name: string; quantity: number }[];
}

const LowQuantityNotification: React.FC<LowQuantityNotificationProps> = ({ lowQuantityItems }) => {
    if (lowQuantityItems.length === 0) return null;

    return (
        <div className="low-quantity-notification">
            <h3>Atenção: Itens com Baixa Quantidade</h3>
            <ul>
                {lowQuantityItems.map((item, index) => (
                    <li key={index}>
                        {item.name}: {item.quantity} unidades restantes
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LowQuantityNotification;
