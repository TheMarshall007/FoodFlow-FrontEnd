import { useEffect, useReducer, useRef } from "react";
import { useUser } from "../../context/UserContext";
import { fetchLowQuantityProducts, fetchPantry, fetchProductsByPantryId, Pantry, PantryProduct, reduceProductQuantity } from "../../services/pantry/pantryService";
import { fetchShoppingList, updateProductQuantityInShoppingList, removeProductFromShoppingList, ShoppingList, } from "../../services/shopping/shoppingListService";
import { fetchShoppingCartHistory, ShoppingCartHistory } from "../../services/shopping/shoppingCartHistoryService";
import { fetchProductsByIds, fetchProductsWithDetailsByIds, Product } from "../../services/product/productService";
import { fetchVarietyByIds, Variety } from "../../services/variety/varietyService";

// Define o estado inicial
export const initialState = {
    pantry: {} as Pantry,
    shoppingList: null as ShoppingList | null,
    history: [] as ShoppingCartHistory[],
    isModalOpen: false,
    activeTab: "products" as "products" | "shoppingList" | "history",
};

// Define as ações possíveis
type Action =
    | { type: "SET_PANTRY"; payload: Pantry }
    | { type: "SET_SHOPPING_LIST"; payload: ShoppingList }
    | { type: "SET_HISTORY"; payload: ShoppingCartHistory[] }
    | { type: "UPDATE_PANTRY_PRODUCTS"; payload: PantryProduct[] }
    | { type: "SET_ACTIVE_TAB"; payload: "products" | "shoppingList" | "history" };

// Função `reducer` para modificar o estado com base nas ações
export function pantryReducer(state: typeof initialState, action: Action) {
    switch (action.type) {
        case "SET_PANTRY": return { ...state, pantry: action.payload };
        case "SET_SHOPPING_LIST": return { ...state, shoppingList: action.payload };
        case "SET_HISTORY": return { ...state, history: action.payload, };
        case "SET_ACTIVE_TAB": return { ...state, activeTab: action.payload };
        case "UPDATE_PANTRY_PRODUCTS": return { ...state, pantry: { ...state.pantry, products: action.payload, }, };
        default: return state;
    }
}

export const usePantryDetail = (id: number) => {
    const { user } = useUser();
    const [state, dispatch] = useReducer(pantryReducer, initialState);
    const hasFetched = useRef(false); // Controle de execução
    useEffect(() => {
        const fetchData = async () => {
            if (!hasFetched.current && user && id) {
                hasFetched.current = true; // Marca como executado
                try {
                    // Buscar dados da despensa
                    const pantryData = await fetchPantry({ pantryId: id, page: 0 });
                    pantryData[0].lowQuantityProducts = await fetchLowQuantityProducts(id);
                    pantryData[0].products = await fetchProductsByPantryId(id);
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
            if (!state.pantry.products) return;

            // Atualiza apenas os produtos modificados na despensa sem perder os dados existentes
            const updatedPantryItems = state.pantry.products.map((product) =>
                product.id === productId // Corrigindo a comparação, pois `systemProductId` não existe
                    ? { ...product, quantity: (product.quantity ?? 0) - quantityToReduce } // Usando `quantity` no lugar de `plannedQuantity`
                    : product
            );

            dispatch({
                type: "UPDATE_PANTRY_PRODUCTS",
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