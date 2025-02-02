import { api } from '../api/apiConfig';

export async function fetchDailySuggestion(pantryId: number) {
  try {
    const response = await api.get(`/dish/daily_suggestion/${pantryId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar as sugestãos do dia:', error);
    return null;
  }
}
