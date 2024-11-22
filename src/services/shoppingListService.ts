import { api } from './apiConfig';
import { Items } from './ingredientsService';

export interface ShoppingListInsertParam {
    itemsId: number[];
    pantryId?: number;
    menuId?: number;
    userId: number
}

interface ShoppingListSearchParam {
    userId?: number;
    pantryId?: number;
    menuId?: number;
    page: number;
}


export async function createShoppingList(data: ShoppingListInsertParam) {
    try {
        const response = await api.post('/shopping_list/insert', data);
        return response.status;
    } catch (error) {
        console.error('Erro ao inserir lista de compra:', error);
        return [];
    }
}

export async function fetchShoppingList(data: ShoppingListSearchParam) {
    try {
        const response = await api.post('/shopping_list/pagination', data);
        return response.data.content;
    } catch (error) {
        console.error('Erro ao buscar as listas de compras:', error);
        return [];
    }
}