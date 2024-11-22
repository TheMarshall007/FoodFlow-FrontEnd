import { api } from './apiConfig';

interface IngredientSearchProps {
    page?: number
}

export interface IngredientInsertProps {
    pantryId: number,
    items: Items[]
}

export interface Items {
    id: number,
    quantity: number,
}

export async function fetchIngredientsByIds(data: number[]) {
    try {
        const response = await api.post('/ingredient/find_by_ids', data);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar o ingredientes:', error);
        return [];
    }
}

export async function fetchIngredients(data: IngredientSearchProps) {
    try {
        const response = await api.post('/ingredient/pagination', data);
        return response.data.content;
    } catch (error) {
        console.error('Erro ao buscar o ingredientes:', error);
        return [];
    }
}

export async function addIngredients(data: IngredientInsertProps) {
    try {
        const response = await api.post('/ingredient/add_ingredients', data);
        return response.data.content;
    } catch (error) {
        console.error('Erro ao inserir os ingredientes na despensa:', error);
        return [];
    }
}
