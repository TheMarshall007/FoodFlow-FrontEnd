import { fetchIngredientsByIds, Ingredient } from "../ingredients/ingredientsService";
import { api } from "../api/apiConfig";
import { fetchVarietyByIds, Variety } from "../variety/varietyService";

export interface Product {
    gtin: string;
    brand: string;
    quantityPerUnit: number;
    unit: UnitOfMeasure;
    varietyId: number;
    variety: Variety;
}

interface ProductDTOSearch {
    id?: number;
    page: number
}

export enum UnitOfMeasure {
    GRAM = "g",
    KILOGRAM = "Kg",
    MILLILITER = "ml",
    LITER = "L",
    UNIT = "unit"
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

export const fetchProductsByIds = async (gtins: string[]): Promise<Product[]> => {
    try {
        const response = await api.post(`/product/findByIds`, gtins);
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

export const fetchProductsWithDetailsByIds = async (productGtins: string[]) => {
    let products: Product[] = [];
    let varieties: Variety[] = [];
    if (productGtins.length > 0) {
        products = await fetchProductsByIds(productGtins);
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