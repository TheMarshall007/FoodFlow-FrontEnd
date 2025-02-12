import { fetchIngredientsByIds, Ingredient } from "../ingredients/ingredientsService";
import { api } from "../api/apiConfig";
import { fetchVarietyByIds } from "../variety/varietyService";

export interface Product {
    id: number;
    brand: string;
    quantityPerUnit: number;
    unit: string;
    varietyId: number;
    variety?: Variety;
}

interface Variety {
    id: number;
    name: string;
    ingredientId: number;
    ingredient?: Ingredient;
}

interface ProductDTOSearch {
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

export const fetchProductsWithDetailsByIds = async (productIds: number[]) => {
    let products: Product[] = [];
    let varieties: Variety[] = [];
    if (productIds.length > 0) {
        products = await fetchProductsByIds(productIds);
        const varietyIds = products.map((product) => product.varietyId).filter((id): id is number => id !== null);
        varieties = await fetchVarietiesWithDetailsByIds(varietyIds);
        products = products.map((product) => ({
            ...product,
            variety: varieties.find((variety) => variety.id === product.varietyId) ?? {} as Variety
        }));
    }
    return products;
};

export const fetchVarietiesWithDetailsByIds = async (varietyIds: number[]) => {
    let varieties: Variety[] = [];
    let ingredients: Ingredient[] = [];
    if (varietyIds.length > 0) {
        varieties = await fetchVarietyByIds(varietyIds);
        const ingredientIds = varieties.map((variety) => variety.ingredientId);
        if (ingredientIds.length > 0) {
            ingredients = await fetchIngredientsByIds(ingredientIds);
        }
        varieties = varieties.map((variety) => ({
            ...variety,
            ingredient: ingredients.find((ingredient) => ingredient.id === variety.ingredientId) ?? {} as Ingredient
        }));
    }
    return varieties
}