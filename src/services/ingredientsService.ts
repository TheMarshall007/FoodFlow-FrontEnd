import { api } from './apiConfig';

export async function fetchIngredientsByIds(data: number[]) {
    try {
        const response = await api.post('/ingredient/find_by_ids', data);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar o ingredientes:', error);
        return [];
    }
}
