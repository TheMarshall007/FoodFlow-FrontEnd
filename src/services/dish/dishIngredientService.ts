import { api } from '../api/apiConfig';
import { Dish } from './dishService';
import { Ingredient } from '../ingredients/ingredientsService';

// Defina a interface para representar a estrutura do objeto retornado pela API
export interface DishIngredient {
  id: number;
  dish: Dish;
  systemIngredient: Ingredient;
  quantity: number;
  unit: string;
}

// Interface para enviar os ids para o back end
interface DishIngredientRequest {
  ids: number[];
}

// Função para buscar os DishIngredients por uma lista de IDs
export async function fetchDishIngredientsByIds(ids: number[]): Promise<DishIngredient[]> {
  try {
    const response = await api.post('/dishIngredient/ingredientsByIds', ids);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar os DishIngredients:', error);
    throw error; // Added to rethrow the error for proper handling
  }
}
