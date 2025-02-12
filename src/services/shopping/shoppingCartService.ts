import { api } from "../api/apiConfig";
import { Product } from "../product/productService";

export interface ShoppingCartProductInsert {
    productId: number
    plannedQuantity?: number;
    cartQuantity: number;
    price: number;
}

export interface ShoppingCartProduct {
    id: number;
    product: Product
    plannedQuantity?: number;
    cartQuantity: number;
    unityPrice?: number;
    price: number;
}

export interface ShoppingCart {
    id?: number;
    pantryId?: number;
    products: ShoppingCartProduct[];
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
 * Adiciona um product ao carrinho de compras.
 */
export const addProductToShoppingCart = async (pantryId: number, products: ShoppingCartProductInsert[]): Promise<ShoppingCart> => {
    try {
        const response = await api.post(`/pantries/${pantryId}/shopping-cart/products`, products);
        return response.data;
    } catch (error) {
        console.error('Erro ao adicionar product ao carrinho:', error);
        throw error;
    }
};

/**
 * Atualiza um product do carrinho de compras.
 */
export const updateShoppingCartProduct = async (pantryId: number, productId: number, product: ShoppingCartProduct): Promise<ShoppingCart> => {
    try {
        const response = await api.put(`/pantries/${pantryId}/shopping-cart/products/${productId}`, product);
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar product do carrinho:', error);
        throw error;
    }
};

/**
 * Remove um product do carrinho de compras.
 */
export const removeShoppingCartProduct = async (pantryId: number, productId: number): Promise<ShoppingCart> => {
    try {
        const response = await api.delete(`/pantries/${pantryId}/shopping-cart/products/${productId}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao remover product do carrinho:', error);
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
