import { api } from '../api/apiConfig';

export interface ShoppingList {
    items: ShoppingListItem[];
    pantryId: number;
}

export interface ShoppingListItem {
    id: number;
    ingredientId: number;
    name: string;
    quantity: number;
    category: string;
}

export interface ShoppingListInsert {
    pantryId: number;
    items: ShoppingListItemInsert[];
}

export interface ShoppingListItemInsert {
    ingredientId: number;
    quantity: number;
}

export const fetchShoppingList = async (pantryId: number): Promise<ShoppingList> => {
    try {
        const response = await api.get(`shopping_list/${pantryId}/shoppingList`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar a lista de compras:', error);
        throw error;
    }
};

export const addItemsToShoppingList = async (data: ShoppingListInsert) => {
    try {
        const response = await api.post(`/shopping_list/insert`, data);
        return response.data;
    } catch (error) {
        console.error('Erro ao adicionar itens à lista de compras:', error);
        throw error;
    }
};

export const updateItemQuantityInShoppingList = async (
    pantryId: number,
    ingredientId: number,
    quantity: number
) => {
    try {
        const response = await api.put(
            `/shopping_list/${pantryId}/items/${ingredientId}`,
            null, // Corpo da requisição vazio, pois estamos usando parâmetros
            {
                params: { quantity },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar a quantidade do item na lista de compras:', error);
        throw error;
    }
};

export const removeItemFromShoppingList = async (pantryId: number, ingredientId: number) => {
    try {
        const response = await api.delete(`/shopping_list/${pantryId}/items/${ingredientId}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao remover item da lista de compras:', error);
        throw error;
    }
};
