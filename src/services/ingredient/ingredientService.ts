import { api } from '../api/apiConfig';
import { PaginatedResponse } from '../api/apiResponse';
import { Category } from '../dish/dishCategoryService';

// Tipos de Ingrediente (IngredientType)
export type IngredientType = 'USABLE' | 'INDUSTRIAL';

// DTO para Inserção de Ingrediente (IngredientDTOInsert)
export interface IngredientDTOInsert {
    name: string;
    categoryId?: number | null;
    type: IngredientType;
}

// DTO para Atualização de Ingrediente (IngredientDTOUpdate)
export interface IngredientDTOUpdate {
    id: number;
    name: string;
    categoryId?: number | null;
    type: IngredientType;
}

// DTO para Resposta de Ingrediente (IngredientDTOResponse)
export interface IngredientDTOResponse {
    id: number;
    name: string;
    categoryId?: number | null;
    isValidated: boolean;
    type: IngredientType;
}

// DTO para Resposta Simples de Ingrediente (IngredientDTOResponseSimple)
export interface IngredientDTOResponseSimple {
    id: number;
    name: string;
}

// DTO para Pesquisa de Ingrediente (IngredientDTOSearch)
export interface IngredientDTOSearch {
    ingredientId?: number;
    page: number;
}

// Interface para Ingrediente (simplificada para uso interno)
export interface Ingredient {
    id: number;
    name: string;
    categoryId?: number | null;
    category?: IngredientCategory;
    type: IngredientType;
    isValidated: boolean;
}

export interface IngredientCategory {
    id: number;
    name: string;
}


// Função para inserir um ingrediente
export async function insertIngredient(data: IngredientDTOInsert): Promise<IngredientDTOResponse> {
    try {
        const response = await api.post('/ingredient/insert', data);
        return response.data;
    } catch (error) {
        console.error('Erro ao inserir ingrediente:', error);
        throw error;
    }
}

// Função para inserir uma lista de ingredientes
export async function insertIngredientList(data: IngredientDTOInsert[]): Promise<IngredientDTOResponse[]> {
    try {
        const response = await api.post('/ingredient/insert_list', data);
        return response.data;
    } catch (error) {
        console.error('Erro ao inserir lista de ingredientes:', error);
        throw error;
    }
}

// Função para buscar um ingrediente por ID
export async function findIngredientById(id: number): Promise<IngredientDTOResponse> {
    try {
        const response = await api.post(`/ingredient/find_by_id/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar ingrediente com ID ${id}:`, error);
        throw error;
    }
}

// Função para buscar ingredientes por IDs
export async function findIngredientsByIds(ids: number[]): Promise<IngredientDTOResponse[]> {
    try {
        const response = await api.post('/ingredient/find_by_ids', ids);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar os ingredientes por IDs:', error);
        throw error;
    }
}

// Função para buscar ingredientes com paginação
export async function fetchIngredients(data: IngredientDTOSearch): Promise<PaginatedResponse<IngredientDTOResponse>> {
    try {
        const response = await api.post('/ingredient/pagination', data);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar os ingredientes:', error);
        throw error;
    }
}

// Função para atualizar ingredientes para camel case
export async function updateIngredientsToCamelCase(): Promise<void> {
    try {
        await api.post('/ingredient/update_to_camel_case');
    } catch (error) {
        console.error('Erro ao atualizar ingredientes para camel case:', error);
        throw error;
    }
}

// Função para atualizar um ingrediente
export async function updateIngredient(data: IngredientDTOUpdate): Promise<IngredientDTOResponse> {
    try {
        const response = await api.put(`/ingredient/update/${data.id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar ingrediente com ID ${data.id}:`, error);
        throw error;
    }
}

// Função para buscar ingredientes por categoria e tipo
export async function findByCategoryIdAndType(categoryId: number, type: IngredientType): Promise<IngredientDTOResponse[]> {
    try {
        const response = await api.post(`/ingredient/find_by_category_and_type/${categoryId}/${type}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar ingredientes por categoria ${categoryId} e tipo ${type}:`, error);
        throw error;
    }
}

// Função para buscar ingredientes por validação
export async function findByIsValidated(isValidated: boolean): Promise<IngredientDTOResponse[]> {
    try {
        const response = await api.post(`/ingredient/find_by_is_validated/${isValidated}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar ingredientes por validação ${isValidated}:`, error);
        throw error;
    }
}

// Função para validar um ingrediente
export async function validateIngredient(ingredientId: number): Promise<IngredientDTOResponse> {
    try {
        const response = await api.post(`/ingredient/validate_ingredient/${ingredientId}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao validar ingrediente com ID ${ingredientId}:`, error);
        throw error;
    }
}

// Função para excluir um ingrediente
export async function deleteIngredient(id: number): Promise<void> {
    try {
        await api.delete(`/ingredient/${id}`);
    } catch (error) {
        console.error(`Erro ao excluir ingrediente com ID ${id}:`, error);
        throw error;
    }
}
