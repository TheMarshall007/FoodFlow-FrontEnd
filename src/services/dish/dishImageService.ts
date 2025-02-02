// src/services/dishImageService.ts
import { api } from '../api/apiConfig';

export async function fetchDishImage(imageId: number) {
    const response = await api.post(`/dish_image/find_by_id/${imageId}`);
    return response.data;
}
