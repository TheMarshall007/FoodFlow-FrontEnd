import User from '../context/UserContext';
import { api } from './apiConfig';
interface PantryData {
    userId?: number;
    inventoryId?: number;
    page: number;
}

export interface Pantry {
    id: number;
    propertyName: string;
    items: PantryItem[];
    sharedWith: User[];
    lastUpdated: string;
    lowQuantityItems: PantryItem[];
    image: string;
}

export interface PantryItem {
    ingredient: {
        name: string;
        status: string;
    }
    quantity: number;
}

export async function fetchPantry(data: PantryData) {
    try {
        const response = await api.post('/inventory/pagination', data);
        return response.data.content;
    } catch (error) {
        console.error('Erro ao buscar o inventário:', error);
        return [];
    }
}

export async function fetchPantryByUserId(userId: number) {
    try {
        const response = await api.post(`/inventory/userId=${userId}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar o inventário:', error);
        return [];
    }
}

export async function fetchItemsByPantryId(inventoryId: number) {
    try {
        const response = await api.get(`/inventory/${inventoryId}/items`);
        console.log("LOGG RESP", response)
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar o itens do inventário:', error);
        return [];
    }
}

export async function reduceItemQuantity(inventoryId: number, ingredientId: number, quantityToReduce: number) {
    try {
        const response = await api.post(`/inventory/${inventoryId}/reduce-quantity`, null, {
            params: { ingredientId, quantityToReduce },
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar o inventário:', error);
        return [];
    }
}

export const fetchLowQuantityItems = async (inventoryId: number, threshold: number = 5) => {
    try {
        const response = await api.get(`/inventory/${inventoryId}/low-quantity`, {
            params: { threshold },
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar o ingredientes baixos:', error);
        return [];
    }
};