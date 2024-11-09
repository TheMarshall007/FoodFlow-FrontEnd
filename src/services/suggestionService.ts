import { api } from './apiConfig';

export async function fetchSuggestedDishes(userId: number) {
  try {
    const response = await api.get(`/dish/suggestion/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar as sugestãos extras:', error);
    return null;
  }
}
