import { useEffect, useReducer, useRef } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { fetchLowQuantityProducts, fetchPantry, fetchProductsByPantryId, Pantry, PantryProduct, reduceProductQuantity } from "../../services/pantry/pantryService";
import { fetchShoppingList, updateProductQuantityInShoppingList, ShoppingListProduct, removeProductFromShoppingList, ShoppingList, } from "../../services/shopping/shoppingListService";
import { fetchShoppingCartHistory, ShoppingCartHistory } from "../../services/shopping/shoppingCartHistoryService";
import { fetchProducts, fetchProductsByIds, fetchProductsWithDetailsByIds, fetchVarietiesWithDetailsByIds, Product } from "../../services/product/productService";
import { updateShoppingListWithProductNames } from "../../utils/shoppingListUtils";
import { fetchVarietyByIds, Variety } from "../../services/variety/varietyService";
import { ShoppingCart } from "../../services/shopping/shoppingCartService";

// Define o estado inicial
export const initialState = {
    pantry: {} as Pantry,
    shoppingList: null as ShoppingList | null,
    history: [] as ShoppingCartHistory[],
    isModalOpen: false,
    activeTab: "items" as "items" | "shoppingList" | "history",
};

// Define as ações possíveis
type Action =
    | { type: "SET_PANTRY"; payload: Pantry }
    | { type: "SET_SHOPPING_LIST"; payload: ShoppingList }
    | { type: "SET_HISTORY"; payload: ShoppingCartHistory[] }
    | { type: "UPDATE_PANTRY_ITEMS"; payload: PantryProduct[] }
    | { type: "TOGGLE_MODAL" }
    | { type: "SET_ACTIVE_TAB"; payload: "items" | "shoppingList" | "history" };

// Função `reducer` para modificar o estado com base nas ações
export function pantryReducer(state: typeof initialState, action: Action) {
    switch (action.type) {
        case "SET_PANTRY": return { ...state, pantry: action.payload };
        case "SET_SHOPPING_LIST": return { ...state, shoppingList: action.payload };
        case "SET_HISTORY": return { ...state, history: action.payload, };
        case "TOGGLE_MODAL": return { ...state, isModalOpen: !state.isModalOpen };
        case "SET_ACTIVE_TAB": return { ...state, activeTab: action.payload };
        case "UPDATE_PANTRY_ITEMS": return { ...state, pantry: { ...state.pantry, items: action.payload, }, };
        default: return state;
    }
}

export const usePantryDetail = (id: number) => {
    const { user } = useUser();
    const [state, dispatch] = useReducer(pantryReducer, initialState);
    const hasFetched = useRef(false); // Controle de execução

    const fetchProductsAndVarietiesByIds = async (productIds: number[]) => {
        let products: Product[] = [];
        let varieties: Variety[] = [];

        if (productIds.length > 0) {
            products = await fetchProductsByIds(productIds);

            const varietyIds = products.map((product) => product.varietyId).filter((id) => id !== null);
            if (varietyIds.length > 0) {
                varieties = await fetchVarietyByIds(varietyIds);
            }
        }

        return { products, varieties };
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!hasFetched.current && user && id) {
                hasFetched.current = true; // Marca como executado
                try {
                    // Buscar dados da despensa
                    const pantryData = await fetchPantry({ pantryId: id, page: 0 });
                    pantryData[0].lowQuantityProducts = await fetchLowQuantityProducts(id);
                    pantryData[0].items = await fetchProductsByPantryId(id);
                    dispatch({ type: "SET_PANTRY", payload: pantryData[0] });

                    // Buscar lista de compras
                    const shoppingListData = await fetchShoppingList(id);
                    const productIds = shoppingListData.products.map((item) => item.systemProductId);
                    const productsWithDetails = await fetchProductsWithDetailsByIds(productIds);
                    const updatedShoppingList = shoppingListData.products.map((item) => ({
                        ...item,
                        systemProduct: productsWithDetails.find((product) => product.id === item.systemProductId) || {} as Product
                    }));
                    const updatedCartWithUnitPrice = { ...shoppingListData, products: updatedShoppingList };
                    // Atualizar lista de compras com produtos e variedades
                    dispatch({ type: "SET_SHOPPING_LIST", payload: updatedCartWithUnitPrice });

                    // Buscar histórico de compras
                    const shoppingHistory = await fetchShoppingCartHistory(id);
                    dispatch({ type: "SET_HISTORY", payload: shoppingHistory });

                } catch (error) {
                    console.error("Erro ao buscar a despensa:", error);
                }
            }
        };

        fetchData();
    }, [user, id, dispatch]);

    const handleUpdateQuantity = async (productId: number, newQuantity: number) => {
        if (id && user) {
            try {
                const updatedShoppingList = await updateProductQuantityInShoppingList(id, productId, newQuantity);
    
                if (!state.shoppingList) return; // Evita erro de acesso a `null`
    
                // Atualiza apenas os produtos modificados sem perder as outras informações
                const updatedProducts = state.shoppingList.products.map((item) =>
                    item.systemProductId === productId
                        ? { ...item, plannedQuantity: newQuantity } // Atualiza apenas a quantidade
                        : item
                );
    
                dispatch({
                    type: "SET_SHOPPING_LIST",
                    payload: {
                        ...state.shoppingList,
                        pantryId: state.shoppingList.pantryId ?? 0, // Garante que pantryId não seja undefined
                        products: updatedProducts,
                    },
                });
    
            } catch (error) {
                console.error("Erro ao atualizar a quantidade do produto:", error);
                alert("Erro ao atualizar a quantidade. Tente novamente.");
            }
        }
    };
    
    const handleReduceQuantity = async (pantryId: number, productId: number, quantityToReduce: number) => {
        try {
            const updatedProducts = await reduceProductQuantity(pantryId, productId, quantityToReduce);
    
            // Se `state.pantry.items` não existir, não tenta mapear
            if (!state.pantry.items) return;
    
            // Atualiza apenas os produtos modificados na despensa sem perder os dados existentes
            const updatedPantryItems = state.pantry.items.map((item) =>
                item.id === productId // Corrigindo a comparação, pois `systemProductId` não existe
                    ? { ...item, quantity: (item.quantity ?? 0) - quantityToReduce } // Usando `quantity` no lugar de `plannedQuantity`
                    : item
            );
    
            dispatch({
                type: "UPDATE_PANTRY_ITEMS",
                payload: updatedPantryItems,
            });
    
        } catch (error) {
            console.error("Erro ao reduzir a quantidade do produto:", error);
        }
    };
    
    const handleRemoveProduct = async (itemId: number) => {
        if (id && user) {
            try {
                await removeProductFromShoppingList(id, itemId);
    
                if (!state.shoppingList) return; // Evita erro de acesso a `null`
    
                // Remove apenas o produto correspondente da lista
                const updatedProducts = state.shoppingList.products.filter((item) => item.id !== itemId);
    
                dispatch({
                    type: "SET_SHOPPING_LIST",
                    payload: {
                        ...state.shoppingList,
                        pantryId: state.shoppingList.pantryId ?? 0, // Garante que pantryId não seja undefined
                        products: updatedProducts,
                    },
                });
    
            } catch (error) {
                console.error("Erro ao remover item da lista de compras:", error);
                alert("Erro ao remover item. Tente novamente.");
            }
        }
    };
    
    



    return { state, dispatch, handleUpdateQuantity, handleRemoveProduct, handleReduceQuantity };
};