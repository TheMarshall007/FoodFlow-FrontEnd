import { api } from "../../services/api/apiConfig";
import { Dish } from "../dish/dishService";

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
