import React, { useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, Grid, MenuItem, Select, Typography } from '@mui/material';
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
    const [pantries, setPantries] = useState<Pantry[]>([]);
    const [pantryId, setPantryId] = useState<number | undefined>();
    const [menus, setMenus] = useState<MenuData[]>([]);
    const [menuId, setMenuId] = useState<number | undefined>();

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                const ingredients = await fetchIngredients({ page: 0 });
                setAvailableItems(ingredients);
                console.log("LOGG availableItems", ingredients);

                const fetchedPantries = await fetchPantry({ userId: user?.id, page: 0 });
                setPantries(fetchedPantries);
                console.log("LOGG pantries", fetchedPantries);

                const fetchedMenus = await fetchMenu({ userId: user?.id, page: 0 });
                setMenus(fetchedMenus);
                console.log("LOGG menus", fetchedMenus);
            }
        };
        fetchData();
    }, [user]);

    const handleAddItem = () => {
        setItems((prevItems) => [
            ...prevItems,
            { id: 0, name: '', quantity: 1, price: 0, unitValue: 0 },
        ]);
    };

    const handleRemoveItem = (index: number) => {
        setItems((prevItems) => {
            const removedItem = prevItems[index];
            setAvailableItems((prevAvailableItems) => [...prevAvailableItems, removedItem]);
            console.log("LOGG removedItem", removedItem);
            return prevItems.filter((_, i) => i !== index);
        });
    };

    const handleConfirmItems = async () => {
        if (user) {
            let shoppingListDTO: ShoppingListInsertParam = {
                userId: user.id,
                pantryId: pantryId!,
                menuId,
                itemsId: items.map((item) => item.id),
            };
            console.log("LOGG DTO para enviar", shoppingListDTO);
            try {
                const response = await createShoppingList(shoppingListDTO);
                if (response === 200) {
                    navigate('/shopping');
                }
            } catch (error) {
                console.error('Erro ao inserir os ingredientes na despensa:', error);
            }
        }
    };

    const handleSelectItem = (index: number, itemId: number) => {
        const selectedItem = availableItems.find((item) => item.id === itemId);
        if (selectedItem) {
            setItems((prevItems) => {
                const updatedItems = [...prevItems];
                updatedItems[index] = { ...selectedItem, quantity: 1, price: 0, unitValue: 0 };
                console.log("LOGG updatedItems", updatedItems);
                return updatedItems;
            });
            setAvailableItems((prevAvailableItems) => {
                const filteredAvailableItems = prevAvailableItems.filter((item) => item.id !== itemId);
                console.log("LOGG availableItems after removal", filteredAvailableItems);
                return filteredAvailableItems;
            });
        }
    };

    return (
        <Box sx={{ padding: 4, backgroundColor: '#7777' }}>
            <Typography variant="h4" gutterBottom>Adicionar Itens à Lista de Compras</Typography>
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Typography variant="subtitle1">Despensa:</Typography>
                            <Select
                                fullWidth
                                value={pantryId || ''}
                                onChange={(e) => setPantryId(Number(e.target.value))}
                            >
                                <MenuItem value="">
                                    <em>Selecione uma despensa</em>
                                </MenuItem>
                                {pantries.map((pantry) => (
                                    <MenuItem key={pantry.id} value={pantry.id}>
                                        {pantry.propertyName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="subtitle1">Menu:</Typography>
                            <Select
                                fullWidth
                                value={menuId || ''}
                                onChange={(e) => setMenuId(Number(e.target.value))}
                            >
                                <MenuItem value="">
                                    <em>Selecione um menu</em>
                                </MenuItem>
                                {menus.map((menu) => (
                                    <MenuItem key={menu.id} value={menu.id}>
                                        {menu.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Grid container spacing={2}>
                {items.map((item, index) => (
                    <Grid item xs={2} md={2} key={index}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Item {index + 1}</Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle1">Nome:</Typography>
                                    <Select
                                        fullWidth
                                        value={item.id || ''}
                                        onChange={(e) => handleSelectItem(index, Number(e.target.value))}
                                    >
                                        <MenuItem value="">
                                            <em>Selecione um item</em>
                                        </MenuItem>
                                        {availableItems.map((availableItem) => (
                                            <MenuItem key={availableItem.id} value={availableItem.id}>
                                                {availableItem.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Box>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => handleRemoveItem(index)}
                                    sx={{ mt: 2 }}
                                >
                                    Remover Item
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                <Grid item xs={6} md={3} >
                    <Card>
                        <CardContent>
                            <Button
                                variant="outlined"
                                color="secondary"
                                onClick={handleAddItem}
                                sx={{ mt: 2 }}
                            >
                                Adicionar Item Manualmente
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Button
                variant="contained"
                color="success"
                onClick={handleConfirmItems}
                sx={{ mt: 4 }}
            >
                Confirmar Itens
            </Button>
        </Box>
    );
};

export default ShoppingListForm;
