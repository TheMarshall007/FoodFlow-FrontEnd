import { useEffect, useReducer } from "react";
import {
  fetchShoppingCart,
  updateShoppingCartItem,
  removeShoppingCartItem,
  finalizePurchase,
  ShoppingCart,
  ShoppingCartItem,
  addItemToShoppingCart,
  loadCartFromShoppingList,
  ShoppingCartItemInsert,
} from "../services/shopping/shoppingCartService";
import { useUser } from "../context/UserContext";
import { ShoppingListItem } from "../services/shopping/shoppingListService";

// 1. Definindo o tipo do estado
type ShoppingCartState = {
  cart: ShoppingCart | null;
  loading: boolean;
  error: string | null;
};

const initialState: ShoppingCartState = {
  cart: null,
  loading: false,
  error: null,
};

// 2. Definindo o tipo de ação do reducer
type ShoppingCartAction =
  | { type: "SET_CART"; payload: ShoppingCart }
  | { type: "ADD_ITEM"; payload: ShoppingCartItem }
  | { type: "UPDATE_ITEM"; payload: ShoppingCartItem }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "FINALIZE_PURCHASE" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string };

// 3. Implementação do reducer
const shoppingCartReducer = (
  state: ShoppingCartState,
  action: ShoppingCartAction
): ShoppingCartState => {
  switch (action.type) {
    case "SET_CART":
      return { ...state, cart: action.payload, loading: false, error: null };
    case "ADD_ITEM":
      return state.cart
        ? { ...state, cart: { ...state.cart, items: [...state.cart.items, action.payload] } }
        : state;
    case "UPDATE_ITEM":
      return state.cart
        ? {
          ...state,
          cart: {
            ...state.cart,
            items: state.cart.items.map((item) =>
              item.ingredient.id === action.payload.ingredient.id ? action.payload : item
            ),
          },
        }
        : state;
    case "REMOVE_ITEM":
      return state.cart
        ? {
          ...state,
          cart: { ...state.cart, items: state.cart.items.filter((item) => item.ingredient.id !== action.payload) },
        }
        : state;
    case "FINALIZE_PURCHASE":
      return state.cart
        ? { ...state, cart: { ...state.cart, items: [] } }
        : state;
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

// 4. Hook useShoppingCart com tipagem explícita no useReducer e tratamento dos erros
export const useShoppingCart = (pantryId: number) => {
  const { user } = useUser();
  const [state, dispatch] = useReducer<React.Reducer<ShoppingCartState, ShoppingCartAction>>(
    shoppingCartReducer,
    initialState
  );

  useEffect(() => {
    if (user && pantryId) {
        dispatch({ type: "SET_LOADING", payload: true });

        loadCartFromShoppingList(pantryId)
            .then((cart) => {
                // Recalcula o valor unitário de todos os itens do carrinho antes de armazená-los no estado
                const updatedCartWithUnitPrice = {
                    ...cart,
                    items: cart.items.map(item => ({
                        ...item,
                        unityPrice: item.cartQuantity > 0 ? item.price / item.cartQuantity : 0 // Evita divisão por zero
                    }))
                };

                dispatch({ type: "SET_CART", payload: updatedCartWithUnitPrice });
            })
            .catch((error: unknown) => {
                const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
                dispatch({ type: "SET_ERROR", payload: errorMessage });
            });
    }
}, [user, pantryId]);


  const handleAddToCart = async (data: ShoppingListItem[]) => {
    try {
        // Converte ShoppingListItem[] para ShoppingCartItem[]
        const cartItems: ShoppingCartItemInsert[] = data.map((item) => ({
            ingredientId: item.ingredientId,
            plannedQuantity: 0,
            cartQuantity: item.quantity,
            price: 0
        }));

        // Envia os itens convertidos para o backend
        const updatedCart = await addItemToShoppingCart(pantryId, cartItems);
        dispatch({ type: "SET_CART", payload: updatedCart });
    } catch (error: unknown) {
        console.error("Erro ao adicionar itens ao carrinho:", error);
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
    }
};


const handleUpdateCartItem = async (data: ShoppingCartItem) => {
  try {
      const updatedCart = await updateShoppingCartItem(pantryId, data.id, data);

      const updatedCartWithUnitPrice = {
          ...updatedCart,
          items: updatedCart.items.map(item => ({
              ...item,
              unityPrice: item.cartQuantity > 0 ? item.price / item.cartQuantity : 0 // Evita divisão por zero
          }))
      };

      dispatch({ type: "SET_CART", payload: updatedCartWithUnitPrice });
  } catch (error: unknown) {
      console.error("Erro ao atualizar item:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
  }
};


  const handleRemoveCartItem = async (cartItemId: number) => {
    try {
      await removeShoppingCartItem(pantryId, cartItemId);
      dispatch({ type: "REMOVE_ITEM", payload: cartItemId });
    } catch (error: unknown) {
      console.error("Erro ao remover item:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
    }
  };

  const handleFinalizePurchase = async () => {
    try {
      await finalizePurchase(pantryId);
      dispatch({ type: "FINALIZE_PURCHASE" });
    } catch (error: unknown) {
      console.error("Erro ao finalizar a compra:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
    }
  };

  return {
    cart: state.cart,
    loading: state.loading,
    error: state.error,
    handleAddToCart,
    handleUpdateCartItem,
    handleRemoveCartItem,
    handleFinalizePurchase,
  };
};
