import { fetchIngredientsByIds, Ingredient } from "../ingredients/ingredientsService";
import { api } from "../api/apiConfig";
import { PaginatedResponse } from "../api/apiResponse";

export interface Product {
    gtin: string;
    name: string;
    brand: string;
    quantityPerUnit: number;
    unit: UnitOfMeasure;
    ingredientsIds: number[]; // Correctly using an array
    ingredients?: Ingredient[]; // Added ingredient property for fetched detail
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

export interface ProductDTOResponseSimple {
    gtin: string;
    name: string;
    brand?: string;
}

export interface ProductDTOInsert {
    gtin: string;
    brand: string;
    name: string;
    quantityPerUnit: number;
    unit: UnitOfMeasure;
    ingredientsIds: number[];
    nutritionalInfo: {
        servingSize: string;
        nutritionalDetails: { [key: string]: number }; // Map
    };
    categoriesIds: number[];
}

export interface ProductFindOrCreateTemporaryRequest {
    gtin: string;
    name: string;
    brand?: string;
    quantityPerUnit?: number;
    unit?: UnitOfMeasure;
    ingredientsIds?: number[];
    userId: number;
}

export interface ProductDTOInsertTemporary {
    gtin: string;
    name: string;
    brand?: string;
    quantityPerUnit?: number;
    unit?: UnitOfMeasure;
    ingredientsIds?: number[];
    userId: number;
}

export interface ProductDTOResponse {
    gtin: string;
    name: string;
    brand: string;
    quantityPerUnit: number;
    unit: UnitOfMeasure;
    ingredientsIds: number[];
    nutritionalInfo: { [key: string]: number };
    categoriesIds: number[];
    isTemporary: boolean;
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
): Promise<PaginatedResponse<ProductDTOResponse>> => {
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
    let ingredients: Ingredient[] = [];
    if (productGtins.length > 0) {
        products = await fetchProductsByIds(productGtins);
        // Flatten the array of arrays into a single array of IDs
        const ingredientIds = products.flatMap((product) => product.ingredientsIds);
        // Remove duplicates
        const uniqueIngredientIds = Array.from(new Set(ingredientIds)); // Use Array.from() here
        if (uniqueIngredientIds.length > 0) {
            ingredients = await fetchIngredientsByIds(uniqueIngredientIds);
        }
        products = products.map((product) => ({
            ...product,
            // Find the ingredient that matches at least one of the ingredient IDs
            ingredient: ingredients.find((ingredient) => product.ingredientsIds.includes(ingredient.id)) ?? undefined
        }));
    }
    return products;
};

export const findOrCreateTemporaryProduct = async (data: ProductFindOrCreateTemporaryRequest): Promise<ProductDTOResponseSimple> => {
    try {
        const response = await api.post('/product/find_or_create_temporary', data);
        return response.data;
    } catch (error) {
        console.error("Error finding or creating temporary product:", error);
        throw error;
    }
};

export const validateProduct = async (gtin: string, data: ProductDTOInsert): Promise<Product> => {
    try {
        const response = await api.post(`/product/validate/${gtin}`, data);
        return response.data;
    } catch (error) {
        console.error("Error validating product:", error);
        throw error;
    }
};

export const fetchTemporaryProducts = async (isTemporary: boolean): Promise<ProductDTOResponseSimple[]> => {
    try {
        const response = await api.post('/product/isTemporary', isTemporary);
        return response.data;
    } catch (error) {
        console.error("Error fetching temporary products:", error);
        throw error;
    }
};

export const deleteProduct = async (gtin: string): Promise<void> => {
    try {
        await api.delete(`/product/delete/${gtin}`);
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
};

export const updateProduct = async (gtin: string, data: ProductDTOInsert): Promise<ProductDTOResponse> => {
    try {
        const response = await api.put(`/product/update/${gtin}`, data);
        return response.data;
    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
};

export const fetchValidatedProducts = async (isValidated: boolean): Promise<ProductDTOResponse[]> => {
    try {
        const response = await api.post('/product/isValidated', isValidated);
        return response.data;
    } catch (error) {
        console.error("Error fetching validated products:", error);
        throw error;
    }
};

export const validateTemporaryProduct = async (gtin: string): Promise<ProductDTOResponse> => {
    try {
        const response = await api.post(`/product/validate_temporary/${gtin}`);
        return response.data;
    } catch (error) {
        console.error("Error validating temporary product:", error);
        throw error;
    }
};
