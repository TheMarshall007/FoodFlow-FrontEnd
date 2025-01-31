import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    IconButton,
    TextField,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Divider,
    AppBar,
    Toolbar,
    Select,
    MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { fetchIngredients } from '../../services/ingredientsService';
import { fetchPantry, Pantry } from '../../services/pantryService';
import { fetchMenu, MenuData } from '../../services/menuService';
import { useUser } from '../../context/UserContext';
import { createShoppingList, ShoppingListInsertParam } from '../../services/shoppingListService';
import { useNavigate } from 'react-router-dom';

interface Item {
    id: number;
    name: string;
    quantity: number;
}

const ShoppingListForm: React.FC = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [availableItems, setAvailableItems] = useState<Item[]>([]);
    const [cartItems, setCartItems] = useState<{ [key: number]: number }>({});
    const [search, setSearch] = useState<string>('');
    const [cartOpen, setCartOpen] = useState<boolean>(false);
    const [pantries, setPantries] = useState<Pantry[]>([]);
    const [pantryId, setPantryId] = useState<number | undefined>();
    const [menus, setMenus] = useState<MenuData[]>([]);
    const [menuId, setMenuId] = useState<number | undefined>();

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                const ingredients = await fetchIngredients({ page: 0 });
                setAvailableItems(ingredients);
                const fetchedPantries = await fetchPantry({ userId: user?.id, page: 0 });
                setPantries(fetchedPantries);
                const fetchedMenus = await fetchMenu({ userId: user?.id, page: 0 });
                setMenus(fetchedMenus);
            }
        };
        fetchData();
    }, [user]);

    const handleAddToCart = (itemId: number) => {
        setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    };

    const handleIncrement = (itemId: number) => {
        setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    };

    const handleDecrement = (itemId: number) => {
        setCartItems((prev) => {
            const updatedQuantity = (prev[itemId] || 1) - 1;
            if (updatedQuantity <= 0) {
                const { [itemId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [itemId]: updatedQuantity };
        });
    };

    const filteredItems = availableItems.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleCartToggle = () => {
        setCartOpen(!cartOpen);
    };

    const handleConfirmItems = async () => {
        if (user) {
            const shoppingListDTO = {
                userId: user.id,
                pantryId: pantryId!,
                menuId,
                items: Object.entries(cartItems).map(([id, quantity]) => ({
                    ingredientId: parseInt(id),
                    quantity,
                })),
            };
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

    return (
        <Box sx={{ padding: 4, backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
            {/* Top Bar with Cart */}
            <Toolbar>
                <Typography variant="h4" sx={{ flexGrow: 1 }}>
                    Adicionar Itens à Lista de Compras
                </Typography>
                <IconButton color="inherit" onClick={handleCartToggle}>
                    <ShoppingCartIcon />
                </IconButton>
            </Toolbar>
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
            {/* Search Bar */}
            <TextField
                label="Pesquisar Item"
                variant="outlined"
                fullWidth
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mt: 2, mb: 2 }}
            />
            <Button
                variant="contained"
                color="success"
                fullWidth
                onClick={handleConfirmItems}
            >
                Confirmar Itens
            </Button>
            {/* Items List */}
            <Grid container spacing={2}>
                {filteredItems.map((item) => (
                    <Grid item xs={12} sm={6} md={4} key={item.id}>
                        <Card sx={{ backgroundColor: '#fff' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h6">{item.name}</Typography>
                                {cartItems[item.id] ? (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            mt: 2,
                                        }}
                                    >
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleDecrement(item.id)}
                                        >
                                            <RemoveIcon />
                                        </IconButton>
                                        <Typography variant="h6" sx={{ mx: 1 }}>
                                            {cartItems[item.id]}
                                        </Typography>
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleIncrement(item.id)}
                                        >
                                            <AddIcon />
                                        </IconButton>
                                    </Box>
                                ) : (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleAddToCart(item.id)}
                                        sx={{ mt: 2 }}
                                    >
                                        Adicionar
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Cart Drawer */}
            <Drawer anchor="right" open={cartOpen} onClose={handleCartToggle}>
                <Box sx={{ width: 350, padding: 2 }}>
                    <Typography variant="h5" gutterBottom>
                        Carrinho de Compras
                    </Typography>
                    <Divider />
                    <List>
                        {Object.entries(cartItems).map(([id, quantity]) => {
                            const item = availableItems.find(
                                (availableItem) => availableItem.id === parseInt(id)
                            );
                            return item ? (
                                <ListItem key={item.id}>
                                    <ListItemText
                                        primary={item.name}
                                        secondary={`Quantidade: ${quantity}`}
                                    />
                                </ListItem>
                            ) : null;
                        })}
                    </List>
                    <Divider sx={{ my: 2 }} />
                    <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        onClick={handleConfirmItems}
                    >
                        Confirmar Itens
                    </Button>
                </Box>
            </Drawer>
        </Box>
    );
};

export default ShoppingListForm;
