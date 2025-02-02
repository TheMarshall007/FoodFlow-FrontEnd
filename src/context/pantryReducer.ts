import { ShoppingList } from "../services/shopping/shoppingListService";
import { Pantry } from "../services/pantry/pantryService";
import { ShoppingListItem } from "../services/shopping/shoppingListService";
import { Ingredient } from "../services/ingredients/ingredientsService";

// Define o estado inicial
export const initialState = {
    pantry: null as Pantry | null,
    shoppingList: null as ShoppingList | null,
    availableItems: [] as ShoppingListItem[],
    ingredientDetails: [] as Ingredient[],
    isModalOpen: false,
    activeTab: "items" as "items" | "shoppingList" | "history",
};

// Define as ações possíveis
type Action =
    | { type: "SET_PANTRY"; payload: Pantry }
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
