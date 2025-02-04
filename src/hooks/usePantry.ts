import { useEffect, useReducer } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { fetchItemsByPantryId, fetchPantry, Pantry, PantryItem } from "../services/pantry/pantryService";
import {
    fetchShoppingList,
    addItemsToShoppingList,
    updateItemQuantityInShoppingList,
    ShoppingListItem,
    ShoppingListItemInsert,
    removeItemFromShoppingList,
    ShoppingList
} from "../services/shopping/shoppingListService";
import { fetchIngredients, fetchIngredientsByIds, Ingredient } from "../services/ingredients/ingredientsService";
import { updateShoppingListWithIngredientNames } from "../utils/shoppingListUtils";

// Define o estado inicial
export const initialState = {
    pantry: null as Pantry | null,
    pantryItems: [] as PantryItem[],
    shoppingList: null as ShoppingList | null,
    availableItems: [] as ShoppingListItem[],
    ingredientDetails: [] as Ingredient[],
    isModalOpen: false,
    activeTab: "items" as "items" | "shoppingList" | "history",
};

// Define as ações possíveis
type Action =
    | { type: "SET_PANTRY"; payload: Pantry }
    | { type: "SET_PANTRY_ITEMS", payload: PantryItem[] }
    | { type: "SET_SHOPPING_LIST"; payload: ShoppingList }
    | { type: "SET_AVAILABLE_ITEMS"; payload: ShoppingListItem[] }
    | { type: "SET_INGREDIENT_DETAILS"; payload: Ingredient[] }
    | { type: "TOGGLE_MODAL" }
    | { type: "SET_ACTIVE_TAB"; payload: "items" | "shoppingList" | "history" };

// Função `reducer` para modificar o estado com base nas ações
export function pantryReducer(state: typeof initialState, action: Action) {
    switch (action.type) {
        case "SET_PANTRY":
            return { ...state, pantry: action.payload };
        case "SET_PANTRY_ITEMS":
            return { ...state, pantryItems: action.payload, };
        case "SET_SHOPPING_LIST":
            return { ...state, shoppingList: action.payload };
        case "SET_AVAILABLE_ITEMS":
            return { ...state, availableItems: action.payload };
        case "SET_INGREDIENT_DETAILS":
            return { ...state, ingredientDetails: action.payload };
        case "TOGGLE_MODAL":
            return { ...state, isModalOpen: !state.isModalOpen };
        case "SET_ACTIVE_TAB":
            return { ...state, activeTab: action.payload };
        default:
            return state;
    }
}

export const usePantry = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useUser();
    const [state, dispatch] = useReducer(pantryReducer, initialState);

    useEffect(() => {
        async function fetchData() {
            if (user && id) {
                try {
                    const pantryData = await fetchPantry({ pantryId: parseInt(id), page: 0 });
                    dispatch({ type: "SET_PANTRY", payload: pantryData[0] });

                    // Busca os itens da despensa usando o novo endpoint
                    const pantryItems = await fetchItemsByPantryId(parseInt(id));
                    dispatch({ type: "SET_PANTRY_ITEMS", payload: pantryItems });

                    const shoppingListData = await fetchShoppingList(parseInt(id));
                    const ingredientIds = shoppingListData.items.map((item) => item.ingredientId);

                    const ingredients = await fetchIngredientsByIds(ingredientIds);
                    dispatch({ type: "SET_INGREDIENT_DETAILS", payload: ingredients });

                    const updatedShoppingList = updateShoppingListWithIngredientNames(shoppingListData, ingredients);
                    dispatch({ type: "SET_SHOPPING_LIST", payload: updatedShoppingList });

                    const availableItems = await fetchIngredients({ page: 0 })
                    const convertedAvailableItems = availableItems.map((ingredient) => ({
                        id: ingredient.id,
                        ingredientId: ingredient.id,
                        name: ingredient.name,
                        quantity: 0,
                        category: ingredient.category || "Outros",
                    }));
                    dispatch({ type: "SET_AVAILABLE_ITEMS", payload: convertedAvailableItems });
                } catch (error) {
                    console.error("Erro ao buscar a despensa:", error);
                }
            }
        }
        fetchData();
    }, [user, id]);

    /**
     * Adiciona itens à lista de compras.
     * @param {ShoppingListItem[]} items - Os itens a serem adicionados.
     */
    const handleAddItemsToShoppingList = async (items: ShoppingListItem[]) => {
        if (id && user) {
            try {
                const formattedItems: ShoppingListItemInsert[] = items.map((item) => ({
                    ingredientId: item.ingredientId,
                    quantity: item.quantity,
                }));

                // Send the request to add items to the shopping list
                const updatedShoppingList = await addItemsToShoppingList({
                    pantryId: parseInt(id),
                    items: formattedItems,
                });

                // Find missing ingredient details
                const missingIngredientIds = updatedShoppingList.items
                    .map((item: ShoppingListItem) => item.ingredientId)
                    .filter((id: number) => !state.ingredientDetails.some((ing) => ing.id === id));

                let newIngredientDetails: Ingredient[] = [];
                if (missingIngredientIds.length > 0) {
                    // Fetch missing ingredient details
                    newIngredientDetails = await fetchIngredientsByIds(missingIngredientIds);
                    dispatch({
                        type: "SET_INGREDIENT_DETAILS",
                        payload: [...state.ingredientDetails, ...newIngredientDetails],
                    });
                }

                // Update the shopping list with ingredient names
                const updatedItemsWithNames = updatedShoppingList.items.map((item: ShoppingListItem) => ({
                    ...item,
                    name:
                        state.ingredientDetails.find((ing) => ing.id === item.ingredientId)?.name ||
                        newIngredientDetails.find((ing) => ing.id === item.ingredientId)?.name ||
                        "Desconhecido",
                }));

                dispatch({
                    type: "SET_SHOPPING_LIST",
                    payload: { ...updatedShoppingList, items: updatedItemsWithNames },
                });
            } catch (error) {
                console.error("Erro ao adicionar itens à lista de compras:", error);
                alert("Erro ao adicionar itens. Tente novamente.");
            }
        }
    };


    /**
     * Atualiza a quantidade de um item na lista de compras.
     * @param {number} ingredientId - O ID do ingrediente a ser atualizado.
     * @param {number} newQuantity - A nova quantidade do item.
     */
    const handleUpdateQuantity = async (ingredientId: number, newQuantity: number) => {
        if (id && user) {
            try {
                const updatedShoppingList = await updateItemQuantityInShoppingList(
                    parseInt(id),
                    ingredientId,
                    newQuantity
                );

                const updatedShoppingListWithNames = updateShoppingListWithIngredientNames(updatedShoppingList, state.ingredientDetails);
                dispatch({ type: "SET_SHOPPING_LIST", payload: updatedShoppingListWithNames });
            } catch (error) {
                console.error("Erro ao atualizar a quantidade do item:", error);
                alert("Erro ao atualizar a quantidade. Tente novamente.");
            }
        }
    };

    /**
     * Remove um item da lista de compras.
     * @param {number} itemId - O ID do ingrediente a ser atualizado.
     */
    const handleRemoveItem = async (itemId: number) => {
        if (id && user) {
            try {
                const updatedShoppingList = await removeItemFromShoppingList(parseInt(id), itemId);
                const updatedShoppingListWithNames = updateShoppingListWithIngredientNames(updatedShoppingList, state.ingredientDetails);

                dispatch({ type: 'SET_SHOPPING_LIST', payload: updatedShoppingListWithNames });
            } catch (error) {
                console.error('Erro ao remover item da lista de compras:', error);
                alert('Erro ao remover item. Tente novamente.');
            }
        }
    };

    return { state, dispatch, handleAddItemsToShoppingList, handleUpdateQuantity, handleRemoveItem };
};


