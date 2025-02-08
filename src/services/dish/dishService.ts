import { api } from '../api/apiConfig';
interface DishParams {
  dishId?: number;
  page: number;
}
export interface Dish {
  id: number;
  name: string;
  description: string;
  type: string;
  image: { id: number, image: string, type: string };
  ingredientsId: number[];
  price: number;
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

export async function fetchDish(data: DishParams) {
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
  const response = await fetch(`/api/dishes/${dishId}/mark-as-done`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
  });

  if (!response.ok) {
      throw new Error("Erro ao marcar prato como feito");
  }

  return response.json();
};

