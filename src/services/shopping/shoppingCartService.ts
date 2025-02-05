import { api } from "../api/apiConfig";
import { Ingredient } from "../ingredients/ingredientsService";

export interface ShoppingCartItemInsert {
    ingredientId: number
    plannedQuantity?: number;
    cartQuantity: number;
    price: number;
}

export interface ShoppingCartItem {
    id: number;
    ingredient: Ingredient
    plannedQuantity?: number;
    cartQuantity: number;
    unityPrice?: number;
    price: number;
}

export interface ShoppingCart {
    id?: number;
    pantryId?: number;
    items: ShoppingCartItem[];
    createdAt?: string;
}

/**
 * Obtém ou cria o carrinho de compras da despensa especificada.
 */
export const fetchShoppingCart = async (pantryId: number): Promise<ShoppingCart> => {
    try {
        const response = await api.get(`/pantries/${pantryId}/shopping-cart`)
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar o carrinho de compras:', error);
        throw error;
    }
};

/**
 * Carrega itens da lista de compras para o carrinho.
 */
export const loadCartFromShoppingList = async (pantryId: number): Promise<ShoppingCart> => {
    try {
        const response = await api.post(`/pantries/${pantryId}/shopping-cart/load`);
        return response.data;
    } catch (error) {
        console.error('Erro ao carregar itens da lista de compras:', error);
        throw error;
    }
};

/**
 * Adiciona um item ao carrinho de compras.
 */
export const addItemToShoppingCart = async (pantryId: number, items: ShoppingCartItemInsert[]): Promise<ShoppingCart> => {
    try {
        const response = await api.post(`/pantries/${pantryId}/shopping-cart/items`, items);
        return response.data;
    } catch (error) {
        console.error('Erro ao adicionar item ao carrinho:', error);
        throw error;
    }
};

/**
 * Atualiza um item do carrinho de compras.
 */
export const updateShoppingCartItem = async (pantryId: number, itemId: number, item: ShoppingCartItem): Promise<ShoppingCart> => {
    try {
        const response = await api.put(`/pantries/${pantryId}/shopping-cart/items/${itemId}`, item);
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar item do carrinho:', error);
        throw error;
    }
};

/**
 * Remove um item do carrinho de compras.
 */
export const removeShoppingCartItem = async (pantryId: number, itemId: number): Promise<ShoppingCart> => {
    try {
        const response = await api.delete(`/pantries/${pantryId}/shopping-cart/items/${itemId}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao remover item do carrinho:', error);
        throw error;
    }
};

/**
 * Finaliza a compra e limpa o carrinho.
 */
export const finalizePurchase = async (pantryId: number): Promise<void> => {
    try {
        await api.post(`/pantries/${pantryId}/shopping-cart/finalize`);
    } catch (error) {
        console.error('Erro ao finalizar a compra:', error);
        throw error;
    }
};
