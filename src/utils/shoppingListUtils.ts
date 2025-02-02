import { Ingredient } from "../services/ingredients/ingredientsService";
import { ShoppingList } from "../services/shopping/shoppingListService";

/**
 * Atualiza os nomes dos ingredientes dentro da lista de compras.
 */
export const updateShoppingListWithIngredientNames = (
    shoppingList: ShoppingList,
    ingredients: Ingredient[]
): ShoppingList => {
    const updatedItems = shoppingList.items.map((item) => ({
        ...item,
        name:
            ingredients.find((ingredient) => ingredient.id === item.ingredientId)
                ?.name || "Desconhecido",
    }));
    return { ...shoppingList, items: updatedItems };
};
