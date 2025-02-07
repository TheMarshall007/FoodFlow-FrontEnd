// src/services/dishImageService.ts
import { api } from '../api/apiConfig';

export interface Image {
    id: number,
    image: string,
    type: string
}

export async function fetchDishImage( idList : number[] ) {
    const response = await api.post(`/dish_image/findByIds/`, idList);
    return response.data;
}
