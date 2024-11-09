import { api } from './apiConfig';

export async function fetchDailySuggestion(inventoryId: number) {
  try {
    const response = await api.get(`/dish/daily_suggestion/${inventoryId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar as sugestãos do dia:', error);
    return null;
  }
}
