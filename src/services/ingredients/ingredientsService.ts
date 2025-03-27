import { api } from '../api/apiConfig';
import { PaginatedResponse } from '../api/apiResponse';
import { IngredientCategory } from './ingredientCategoryService';

export type IngredientType = 'USABLE' | 'INDUSTRIAL';

export interface Ingredient {
    id: number;
    name: string;
    category: IngredientCategory;
    type: IngredientType;
    isValidated: boolean;
}

export interface IngredientSearchProps {
    page: number;
    size?: number;
    categoryId?: number | null;
    type?: IngredientType | null;
    isValidated?: boolean;
}

export interface IngredientInsertProps {
    pantryId: number;
    items: Products[];
}

export interface Products {
    id: number;
    quantity: number;
}

export interface IngredientCreateOrUpdateProps {
    id?: number; // Optional for updates
    name: string;
    categoryId: number | null;
    type: IngredientType;
    isValidated?: boolean;
}

export async function fetchIngredientsByIds(ids: number[]): Promise<Ingredient[]> {
    try {
        const response = await api.post('/ingredient/find_by_ids', ids);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar os ingredientes por IDs:', error);
        throw error; // Rethrow the error for the calling component to handle
    }
}

export async function fetchIngredients(data: IngredientSearchProps): Promise<PaginatedResponse<Ingredient>> {
    try {
        const response = await api.post('/ingredient/pagination', data);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar os ingredientes:', error);
        throw error; // Rethrow the error for the calling component to handle
    }
}

export async function addIngredients(data: IngredientInsertProps): Promise<Ingredient[]> {
    try {
        const response = await api.post('/ingredient/add_ingredients', data);
        return response.data.content;
    } catch (error) {
        console.error('Erro ao inserir os ingredientes na despensa:', error);
        throw error; // Rethrow the error for the calling component to handle
    }
}

export async function createIngredient(data: IngredientCreateOrUpdateProps): Promise<Ingredient> {
    try {
        const response = await api.post('/ingredient', data);
        return response.data;
    } catch (error) {
        console.error('Erro ao criar ingrediente:', error);
        throw error;
    }
}

export async function updateIngredient(data: IngredientCreateOrUpdateProps & { id: number }): Promise<Ingredient> {
    try {
        const response = await api.put(`/ingredient/${data.id}`, data);
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar ingrediente:', error);
        throw error;
    }
}
