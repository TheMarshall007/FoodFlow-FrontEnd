import { api } from '../api/apiConfig';
import { Ingredient } from '../ingredients/ingredientsService';
import { Category } from './dishCategoryService';

interface DishParams {
  dishId?: number;
  page: number;
}

// Interface updated to reflect the new backend DTO
export interface Dish {
  id: number;
  name: string;
  description: string;
  category: Category; // Using the same existing category interface.
  image: { id: number; image: string; type: string }; // Same format already used.
  ingredientsId: number[]; // List of ingredient IDs.
  price: number;
  ingredients?: { // Optional, only when the dish has the ingredients
    systemIngredientId: number; // this is the id, not the object
    systemIngredient: Ingredient; // the complete object
    quantity: number;
    unit: string;
  }[];
}

// New interface for the creation request
interface CreateDishRequest {
  name: string;
  description: string;
  categoryId: number | null;
  image?: { id?:number, image?:string; type?:string };
  ingredients: {
    ingredientId: number; // Just ingredientId
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
    ingredientId: number; // Just ingredientId
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
    throw error;
  }
}

export async function fetchDishes(data: DishParams) {
  try {
    const response = await api.post('/dish/pagination', data);
    return response.data.content;
  } catch (error) {
    console.error('Erro ao buscar o prato:', error);
    throw error;
  }
}

export async function fetchDishesByIds(ids: number[]) {
  try {
    const response = await api.post('/dish/dishesByIds', ids);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar os pratos:', error);
    throw error;
  }
}

export const markDishAsDone = async (dishId: number) => {
  try {
    const response = await api.post(`/dish/${dishId}/mark-as-done`);
    return response.data;
  } catch (error){
    console.error(`Error marking dish as done: `, error)
    throw error;
  }
};

// Changed the request format.
export async function createDish(dishData: CreateDishRequest) {
  try {
      const response = await api.post("/dish/insert", dishData);
      return response.data;
  } catch(error){
    console.error("Error to create a dish:", error);
    throw error;
  }
}

// Changed the request format.
export async function updateDish(dishData: UpdateDishRequest) {
  try{
    const response = await api.put(`/dish/update`, dishData);
    return response.data;
  } catch(error){
    console.error("Error to update a dish:", error);
    throw error;
  }
}
