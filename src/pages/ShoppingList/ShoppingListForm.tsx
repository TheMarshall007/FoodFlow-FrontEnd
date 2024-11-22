import React, { useState, useEffect } from 'react';
import './ShoppingListForm.css';
import { fetchIngredients } from '../../services/ingredientsService';
import { createShoppingList, ShoppingListInsertParam } from '../../services/shoppingListService';
import { useUser } from '../../context/UserContext';
import { fetchPantry, Pantry } from '../../services/pantryService';
import { fetchMenu, MenuData } from '../../services/menuService';
import { useNavigate } from 'react-router-dom';

interface Item {
    id: number;
    name: string;
    quantity: number;
    price: number;
    unitValue: number;
}

const ShoppingListForm: React.FC = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [items, setItems] = useState<Item[]>([]);
    const [availableItems, setAvailableItems] = useState<Item[]>([]);
    const [pantries, setPentries] = useState<Pantry[]>([])
    const [pantryId, setPantryId] = useState<number>()
    const [menus, setMenus] = useState<MenuData[]>([])
    const [menuId, setMenuId] = useState<number>()


    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                const ingredients = await fetchIngredients({ page: 0 });
                setAvailableItems(ingredients);
                const pantries = await fetchPantry({ userId: user?.id, page: 0 })
                setPentries(pantries)
                const menus = await fetchMenu({ userId: user?.id, page: 0 })
                setMenus(menus)

            }
        }
        fetchData();
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
        if (user) {
            let shoppingListDTO: ShoppingListInsertParam = {
                userId: user?.id,
                pantryId,
                menuId,
                itemsId: items.map((item) => (item.id)),
            };
            console.log("DTO para enviar:", shoppingListDTO);
            try {
                const response = await createShoppingList(shoppingListDTO);
                console.log(response)
                if(response === 200){
                    navigate('/shopping')
                }

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
        <div className="shopping-list-add-items-container">
            <h2>Adicionar Itens à Lista de Compras</h2>
            <button className="add-item-button" onClick={handleAddItem}>Adicionar Item Manualmente</button>
            <div className="shopping-list-item-card">
                <div className="shopping-list-form-group">
                    <label>Despensa:</label>
                    <select
                        value={pantryId}
                        onChange={(e) => setPantryId(parseInt(e.target.value))}
                    >
                        <option value="">Selecione um item</option>
                        {pantries.map((pantry) => (
                            <option key={pantry.id} value={pantry.id}>{pantry.propertyName}</option>
                        ))}
                    </select>
                </div>
                <div className="shopping-list-form-group">
                    <label>Menu:</label>
                    <select
                        value={menuId}
                        onChange={(e) => setMenuId(parseInt(e.target.value))}
                    >
                        <option value="">Selecione um item</option>
                        {menus.map((menu) => (
                            <option key={menu.id} value={menu.id}>{menu.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="shopping-list-items-list">
                {items.map((item, index) => (
                    <div key={index} className="shopping-list-item-card">
                        <div className="shopping-list-form-group">
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
                        <div className="shopping-list-form-group">
                            <label>Quantidade:</label>
                            <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                            />
                        </div>
                        <button className="shopping-list-remove-item-button" onClick={() => handleRemoveItem(index)}>Remover Item</button>
                    </div>
                ))}
            </div>
            <button className="shopping-list-confirm-items-button" onClick={() => handleConfirmItems()}>Confirmar Itens</button>
        </div>
    );
};

export default ShoppingListForm;