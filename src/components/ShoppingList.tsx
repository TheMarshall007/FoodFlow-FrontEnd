// src/components/ShoppingList.tsx
import React, { useState } from 'react';
import './ShoppingList.css';

interface ShoppingItem {
    ingredientName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

interface ShoppingListProps {
    items: { ingredient: { name: string }; quantity: number }[];
    onClose: () => void;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ items, onClose }) => {
    const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(items.map(item => ({
        ingredientName: item.ingredient.name,
        quantity: 1, // Default quantity
        unitPrice: 0,
        totalPrice: 0
    })));

    const handleQuantityChange = (index: number, quantity: number) => {
        const updatedList = [...shoppingList];
        updatedList[index].quantity = quantity;
        updatedList[index].totalPrice = quantity * updatedList[index].unitPrice;
        setShoppingList(updatedList);
    };

    const handleUnitPriceChange = (index: number, unitPrice: number) => {
        const updatedList = [...shoppingList];
        updatedList[index].unitPrice = unitPrice;
        updatedList[index].totalPrice = unitPrice * updatedList[index].quantity;
        setShoppingList(updatedList);
    };

    return (
        <div className="shopping-list-modal">
            <h2>Lista de Compras</h2>
            <button onClick={onClose} className="close-button">Fechar</button>
            <ul className="shopping-list">
                {shoppingList.map((item, index) => (
                    <li key={index} className="shopping-item">
                        <span>{item.ingredientName}</span>
                        <input
                            type="number"
                            placeholder="Quantidade"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                        />
                        <input
                            type="number"
                            placeholder="Valor Unitário"
                            value={item.unitPrice}
                            onChange={(e) => handleUnitPriceChange(index, parseFloat(e.target.value))}
                        />
                        <span>Total: R$ {item.totalPrice.toFixed(2)}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ShoppingList;
