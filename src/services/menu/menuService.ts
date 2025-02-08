import { api } from "../../services/api/apiConfig";
import { Dish } from "../dish/dishService";
import { Pantry } from "../pantry/pantryService";

export interface MenuInsertData {
    userId: number;
    pantryId?: number;
    name: string;
    description: string;
    dishesIds?: [];
}

export interface Menu {
    id: number
    userId: number;
    pantryId?: number;
    pantry?: Pantry;
    name: string;
    description: string;
    dishesIds: [];
    dishes?: Dish[];
}

export async function createMenu(menuData: MenuInsertData) {
    const response = await api.post(`/menu/insert`, menuData);
    return response.data;
};

export async function addDishesToMenu(menuId: number, dishIds: number[]) {
    const response = await api.patch(`/menu/${menuId}/add-dishes`, dishIds);
    return response.data;
};

export async function getMenuById(menuId: number) {
    const response = await api.get(`/menu/${menuId}`);
    return response.data;
};

export async function getMenusPaginated(filters: {
    userId?: number;
    menuId?: number;
    page: number;
}) {
    const response = await api.post(`/menu/pagination`, filters);
    return response.data.content;
};

export const updateMenuPantry = async (menuId: number, pantryId: number) => {
    const response = await api.patch(`/menu/${menuId}/update-pantry`, pantryId);
    return response.data;
};

export async function fetchMenusCountByPantry(pantryId: number): Promise<number> {
    try {
        const response = await api.get(`/menu/count-by-pantry/${pantryId}`);    
        return await response.data;
    } catch (error) {
        console.error("Erro ao buscar número de menus vinculados:", error);
        return 0;
    }
}
