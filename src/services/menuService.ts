import { api } from "./apiConfig";

interface MenuParams {
    userId?: number,
    menuId?: number,
    page: number
}

export interface MenuData {
    id: number;
    userId: number;
    name: string;
    description: string;
    dishesId: number[];
    sharedWithId: number[];
}

export async function fetchMenu(data: MenuParams) {
    try {
        const response = await api.post('/menu/pagination', data);
        return response.data.content;
    } catch (error) {
        console.error('Erro ao buscar os menus:', error);
        return [];
    }
}