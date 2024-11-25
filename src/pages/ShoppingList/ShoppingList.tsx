import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { fetchShoppingList } from "../../services/shoppingListService";
import { Box, Button, Card, CardContent, Grid, Typography } from "@mui/material";

interface ShoppingListItem {
    id: number;
    itemsId: number[];
    dateCreated: string;
    pantryId: number;
    menuId?: number | null;
    userId: number;
}

const ShoppingList: React.FC = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (user?.id) {
                try {
                    const response = await fetchShoppingList({ userId: user.id, page: 0 });
                    setShoppingList(response);
                } catch (error) {
                    console.error("Erro ao buscar as listas de compras:", error);
                }
            }
        };
        fetchData();
    }, [user]);

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" gutterBottom>Listas de Compras</Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/shopping/form")}
                sx={{ marginBottom: 4 }}
            >
                Adicionar Lista de Compras
            </Button>

            <Grid container spacing={2}>
                {shoppingList.length > 0 ? (
                    shoppingList.map((list) => (
                        <Grid item xs={12} md={6} lg={4} key={list.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">Lista de Compras #{list.id}</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Data de Criação: {new Date(list.dateCreated).toLocaleDateString('pt-BR')}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Itens na lista: {list.itemsId.length}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Typography variant="body1">Nenhuma lista de compras encontrada.</Typography>
                )}
            </Grid>
        </Box>
    );
};

export default ShoppingList;
