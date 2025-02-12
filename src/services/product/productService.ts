import { Ingredient } from "../ingredients/ingredientsService";
import { api } from "../api/apiConfig";

export interface Product{
    id: number;
    brand: string;
    quantityPerUnit: number;
    unit: string;
    varietyId: number;
    variety?: Variety;
}

interface Variety{
    id: number;
    name: string;
    ingredientId:number;
    ingredient?: Ingredient;
}

interface ProductDTOSearch{
    id?: number;
    page: number
}

export const fetchProductById = async (id: number): Promise<Product> => {
    try {
        const response = await api.get(`/product/${id}`);
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar produto por ID:", error);
        throw error;
    }
};

export const fetchProductsByIds = async (ids: number[]): Promise<Product[]> => {
    try {
        const response = await api.post(`/product/findByIds`, ids);
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar produto por ID:", error);
        throw error;
    }
};

export const fetchProducts = async (
    dto: ProductDTOSearch
): Promise<{ content: Product[]; totalPages: number; currentPage: number }> => {
    try {
        const response = await api.post(`/product/pagination `, dto);
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar produtos paginados:", error);
        throw error;
    }
};
