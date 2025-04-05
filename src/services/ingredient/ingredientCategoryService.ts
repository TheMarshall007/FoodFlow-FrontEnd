import { api } from '../api/apiConfig';
import { PaginatedResponse } from '../api/apiResponse';

export interface IngredientCategory {
  id: number;
  name: string;
}

export interface IngredientCategorySearchProps {
  page: number;
  size?: number;
}

export async function fetchIngredientCategories(data: IngredientCategorySearchProps): Promise<PaginatedResponse<IngredientCategory>> {
  try {
    const response = await api.post('/ingredientCategory/pagination', data);
    return response.data;
  } catch (error) {
    console.error('Error fetching ingredient categories:', error);
    throw error; // Rethrow the error for proper handling
  }
}
