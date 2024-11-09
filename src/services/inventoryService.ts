import { api } from './apiConfig';
interface inventoryData {
    userId: number;
    inventoryId: number;
    page: number;
}

export async function fetchInventory(data: inventoryData) {
    try {
        const response = await api.post('/inventory/pagination', data);
        return response.data.content;
    } catch (error) {
        console.error('Erro ao buscar o inventário:', error);
        return [];
    }
}

export async function fetchInventoryByUser(userId: number) {
    try {
        const response = await api.post(`/inventory/userId=${userId}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar o inventário:', error);
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