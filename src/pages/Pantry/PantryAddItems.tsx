import React, { useState, useEffect } from 'react';
import './PantryAddItems.css';
import { fetchIngredients, addIngredients, IngredientInsertProps } from '../../services/ingredientsService';
import { useParams } from 'react-router-dom';

interface Item {
    id: number;
    name: string;
    quantity: number;
    price: number;
    unitValue: number;
}

const PantryAddItems: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [items, setItems] = useState<Item[]>([]);
    const [availableItems, setAvailableItems] = useState<Item[]>([]); // Itens disponíveis do backend

    useEffect(() => {
        // Simulação de chamada para o backend para buscar os itens disponíveis
        const fetchAvailableItems = async () => {
            // Substituir por uma chamada real ao backend
            const response = await fetchIngredients({ page: 0 });
            setAvailableItems(response);
        };
        fetchAvailableItems();
    }, []);

    const handleItemChange = (index: number, key: keyof Item, value: string | number) => {
        setItems((prevItems) =>
            prevItems.map((item, i) => {
                if (i === index) {
                    const updatedItem = { ...item, [key]: value };
                    if (key === 'quantity' || key === 'price') {
                        if (updatedItem.quantity > 0 && updatedItem.price > 0) {
                            updatedItem.unitValue = updatedItem.price / updatedItem.quantity;
                        }
                    }
                    return updatedItem;
                }
                return item;
            })
        );
    };

    const handleAddItem = () => {
        setItems((prevItems) => [
            ...prevItems,
            { id: 0, name: '', quantity: 1, price: 0, unitValue: 0 },
        ]);
    };

    const handleRemoveItem = (index: number) => {
        setItems((prevItems) => prevItems.filter((_, i) => i !== index));
    };

    const handleConfirmItems = async () => {
        if (id) {
            const pantryId = parseInt(id)
            const pantryItemsDTO: IngredientInsertProps = {
                pantryId,
                items: items.map((item) => ({
                    id: item.id,
                    quantity: item.quantity,
                })),
            };
            console.log("DTO para enviar:", pantryItemsDTO);
            try {
                const response = await addIngredients(pantryItemsDTO);
                console.log("Resposta do backend:", response);

            } catch (error) {
                console.error('Erro ao inserir os ingredientes na despensa:', error);
            }
        }
    };

    const handleSelectItem = (index: number, itemId: number) => {
        const selectedItem = availableItems.find((item) => item.id === itemId);
        if (selectedItem) {
            setItems((prevItems) =>
                prevItems.map((item, i) =>
                    i === index ? { ...selectedItem, quantity: item.quantity, price: item.price, unitValue: item.unitValue } : item
                )
            );
        }
    };

    return (
        <div className="pantry-add-items-container">
            <h2>Adicionar Itens à Despensa</h2>
            <button className="add-item-button" onClick={handleAddItem}>Adicionar Item Manualmente</button>
            <div className="items-list">
                {items.map((item, index) => (
                    <div key={index} className="item-card">
                        <div className="form-group">
                            <label>Nome:</label>
                            <select
                                value={item.id}
                                onChange={(e) => handleSelectItem(index, parseInt(e.target.value))}
                            >
                                <option value="">Selecione um item</option>
                                {availableItems.map((availableItem) => (
                                    <option key={availableItem.id} value={availableItem.id}>{availableItem.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Quantidade:</label>
                            <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                            />
                        </div>
                        <div className="form-group">
                            <label>Preço:</label>
                            <input
                                type="number"
                                value={item.price}
                                onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                            />
                        </div>
                        <div className="form-group">
                            <label>Valor Unitário:</label>
                            <input
                                type="number"
                                value={item.unitValue}
                                onChange={(e) => handleItemChange(index, 'unitValue', parseFloat(e.target.value))}
                                disabled
                            />
                        </div>
                        <button className="remove-item-button" onClick={() => handleRemoveItem(index)}>Remover Item</button>
                    </div>
                ))}
            </div>
            <button className="confirm-items-button" onClick={handleConfirmItems}>Confirmar Itens</button>
        </div>
    );
};

export default PantryAddItems;