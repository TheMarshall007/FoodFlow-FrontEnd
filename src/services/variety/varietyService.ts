import { api } from "../api/apiConfig";
import { Ingredient } from "../ingredients/ingredientsService";

export interface Variety {
    id: number;
    name: string;
    ingredientId: number;
    ingredient?: Ingredient
}

export const fetchVarietyByIds = async (ids: number[]): Promise<Variety[]> => {
    try {
        const response = await api.post(`/variety/findByIds`, ids);
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar variente por ID:", error);
        throw error;
    }
};
