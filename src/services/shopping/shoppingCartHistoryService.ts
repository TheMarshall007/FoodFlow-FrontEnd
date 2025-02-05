import { api } from "../api/apiConfig";

export interface ShoppingCartHistory {
      id: number;
      pantryId: number;
      purchaseDate: String;
      totalValue: number;
 }

/**
 * Obtém o histórico de compras.
 */
export const fetchShoppingCartHistory = async (pantryId: number): Promise<ShoppingCartHistory[]> => {
    try {
        const response = await api.get(`/pantries/${pantryId}/shopping-history`)
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar o carrinho de compras:', error);
        throw error;
    }
};