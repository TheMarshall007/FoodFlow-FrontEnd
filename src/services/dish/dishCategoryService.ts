import { api } from '../api/apiConfig';

interface CategoryParams {
  page: number;
}

export interface Category {
  id: number;
  category: string;
  displayName: string;
}

export async function fetchCategories(data: CategoryParams) {
  try {
    const response = await api.post('/category/pagination', data);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar as categorias:', error);
    return [];
  }
}
