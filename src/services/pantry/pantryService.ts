import User from '../../context/UserContext';
import { api } from '../api/apiConfig';
import { Ingredient } from '../ingredients/ingredientsService';

export interface PantryInsertData {
    userId: number;
    propertyName: string;
    image: string;
}

interface PantryData {
    userId?: number;
    pantryId?: number | undefined;
    page: number;
}

export interface Pantry {
    id: number;
    propertyName: string;
    items: PantryProduct[];
    sharedWith: User[];
    menuCount?: number
    lastUpdated: string;
    lowQuantityProducts: PantryProduct[];
    image: string;
}

export interface PantryProduct {
    id: number;
    ingredient: Ingredient;
    quantity: number;
}

export async function createPantry(data: PantryInsertData) {
    try {
        const response = await api.post('/pantry/insert', data);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar o inventário:', error);
        return [];
    }
}

export async function fetchPantry(data: PantryData) {
    try {
        const response = await api.post('/pantry/pagination', data);
        return response.data.content;
    } catch (error) {
        console.error('Erro ao buscar o inventário:', error);
        return [];
    }
}

export async function fetchProductsByPantryId(pantryId: number) {
    try {
        const response = await api.get(`/pantry/${pantryId}/products`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar os produtos do inventário:', error);
        return [];
    }
}

export async function reduceProductQuantity(pantryId: number, ingredientId: number, quantityToReduce: number) {
    try {
        const response = await api.post(`/pantry/${pantryId}/reduce-quantity`, null, {
            params: { ingredientId, quantityToReduce },
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar o inventário:', error);
        return [];
    }
}

export const fetchLowQuantityProducts = async (pantryId: number, threshold: number = 5) => {
    try {
        const response = await api.get(`/pantry/${pantryId}/low-quantity`, {
            params: { threshold },
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar o ingredientes baixos:', error);
        return [];
    }
};