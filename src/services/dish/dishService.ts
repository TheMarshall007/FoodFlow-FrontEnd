import { api } from '../api/apiConfig';
interface DishParams {
  dishId?: number;
  page: number;
}
export interface Dish {
  id: number;
  name: string;
  description: string;
  category: Category;
  image: { id: number, image: string, type: string };
  ingredientsId: number[];
  price: number;
}

interface Category {
  id: number;
  category: string;
  displayName: string;
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

export async function createDish(formData: FormData) {
  const response = await api.post("/dishes", formData);
  return response.data;
}
export async function updateDish(formData: FormData) {
  const response = await api.post("/dishes/update", formData);
  return response.data;
}