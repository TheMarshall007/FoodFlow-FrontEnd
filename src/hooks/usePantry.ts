import { useEffect, useReducer } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { pantryReducer, initialState } from "../context/pantryReducer";
import { fetchPantry } from "../services/pantry/pantryService";
import {
    fetchShoppingList,
    addItemsToShoppingList,
    updateItemQuantityInShoppingList,
    ShoppingListItem,
    ShoppingListItemInsert,
    removeItemFromShoppingList
} from "../services/shopping/shoppingListService";
import { fetchIngredients, fetchIngredientsByIds, Ingredient } from "../services/ingredients/ingredientsService";
import { updateShoppingListWithIngredientNames } from "../utils/shoppingListUtils";

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


