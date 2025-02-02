import { api } from '../api/apiConfig';

interface IngredientSearchProps {
    page?: number;
}

export interface IngredientInsertProps {
    pantryId: number;
    items: Items[];
}

export interface Items {
    id: number;
    quantity: number;
}

export interface Ingredient {
    id: number;
    name: string;
    category?: string;
    description: string;
}

export async function fetchIngredientsByIds(ids: number[]): Promise<Ingredient[]> {
    try {
        const response = await api.post('/ingredient/find_by_ids', ids);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar os ingredientes:', error);
        return [];
    }
}

export async function fetchIngredients(data: IngredientSearchProps): Promise<Ingredient[]> {
    try {
        const response = await api.post('/ingredient/pagination', data);
        return response.data.content;
    } catch (error) {
        console.error('Erro ao buscar os ingredientes:', error);
        return [];
    }
}

export async function addIngredients(data: IngredientInsertProps): Promise<Ingredient[]> {
    try {
        const response = await api.post('/ingredient/add_ingredients', data);
        return response.data.content;
    } catch (error) {
        console.error('Erro ao inserir os ingredientes na despensa:', error);
        return [];
    }
}
