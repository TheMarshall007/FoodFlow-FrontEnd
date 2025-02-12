import { api } from '../api/apiConfig';

export interface ShoppingList {
    items: ShoppingListProduct[];
    pantryId: number;
}

export interface ShoppingListProduct {
    id: number;
    productId: number;
    name: string;
    quantity: number;
}

export interface ShoppingListInsertList {
    pantryId: number;
    items: ShoppingListProductInsert[];
}

export interface ShoppingListInsert {
    pantryId: number;
    product: ShoppingListProductInsert;
}

export interface ShoppingListProductInsert {
    productId: number;
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

export const addProductToShoppingList = async (data: ShoppingListInsert) => {
    try {
        const response = await api.post(`/shopping_list/insert`, data);
        return response.data;
    } catch (error) {
        console.error('Erro ao adicionar itens à lista de compras:', error);
        throw error;
    }
};

export const addProductsToShoppingList = async (data: ShoppingListInsertList) => {
    try {
        const response = await api.post(`/shopping_list/insertList`, data);
        return response.data;
    } catch (error) {
        console.error('Erro ao adicionar itens à lista de compras:', error);
        throw error;
    }
};

export const updateProductQuantityInShoppingList = async (
    pantryId: number,
    productId: number,
    quantity: number
) => {
    try {
        const response = await api.put(
            `/shopping_list/${pantryId}/items/${productId}`,
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

export const removeProductFromShoppingList = async (pantryId: number, productId: number) => {
    try {
        const response = await api.delete(`/shopping_list/${pantryId}/items/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao remover item da lista de compras:', error);
        throw error;
    }
};
