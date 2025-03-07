import { api } from '../api/apiConfig';
import { Ingredient } from '../ingredients/ingredientsService';
import { Variety } from '../variety/varietyService';
import { Category } from './dishCategoryService';

interface DishParams {
  dishId?: number;
  page: number;
}

//Interface atualizada para refletir o DTO do back
export interface Dish {
  id: number;
  name: string;
  description: string;
  category: Category; //Utilizando a mesma interface de categoria que ja existe.
  image: { id: number; image: string; type: string }; //Mesmo formato ja utilizado.
  ingredientsId: number[]; //Lista de ids dos ingredientes.
  price: number;
  ingredients?: {
    systemIngredientId: number;
    systemIngredient: Ingredient;
    varietyId?: number | null;
    variety?: Variety;
    quantity: number;
    unit: string;
  }[];
}
//Nova interface para o request de criação
interface CreateDishRequest {
  name: string;
  description: string;
  categoryId: number | null;
  image?: { id?:number, image?:string; type?:string };
  ingredients: {
    ingredientId: number;
    varietyId?: number | null;
    quantity: number;
    unit: string;
  }[];
}
interface UpdateDishRequest {
  id: number;
  name: string;
  description: string;
  categoryId: number | null;
  image?: { id?:number, image?:string; type?:string };
  ingredients: {
    ingredientId: number;
    varietyId?: number | null;
    quantity: number;
    unit: string;
  }[];
}

export async function insertDish() {
  try {
    const response = await api.get('/dish/insert');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar pratos recomendados:', error);
    return [];
  }
}

export async function fetchDishes(data: DishParams) {
  try {
    const response = await api.post('/dish/pagination', data);
    return response.data.content;
  } catch (error) {
    console.error('Erro ao buscar o prato:', error);
    return [];
  }
}

export async function fetchDishesByIds(ids: number[]) {
  try {
    const response = await api.post('/dish/dishesByIds', ids);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar os pratos:', error);
    return [];
  }
}

export const markDishAsDone = async (dishId: number) => {
  const response = await api.post(`/api/dishes/${dishId}/mark-as-done`,);
  return response.data;
};

//Alterado o formato da requisição.
export async function createDish(dishData: CreateDishRequest) {
  const response = await api.post("/dish/insert", dishData);
  return response.data;
}

//Alterado o formato da requisição.
export async function updateDish(dishData: UpdateDishRequest) {
  const response = await api.put(`/dish/update`, dishData);
  return response.data;
}
