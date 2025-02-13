import { useEffect, useReducer, useRef } from "react";
import {
  updateShoppingCartProduct,
  removeShoppingCartProduct,
  finalizePurchase,
  ShoppingCart,
  ShoppingCartProduct,
  addProductToShoppingCart,
  loadCartFromShoppingList,
  ShoppingCartProductInsert,
} from "../services/shopping/shoppingCartService";
import { useUser } from "../context/UserContext";
import { ShoppingListProduct } from "../services/shopping/shoppingListService";
import { fetchProductsWithDetailsByIds, Product } from "../services/product/productService";
import { useParams } from "react-router-dom";

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
  | { type: "ADD_ITEM"; payload: ShoppingCartProduct }
  | { type: "UPDATE_ITEM"; payload: ShoppingCartProduct }
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
        ? { ...state, cart: { ...state.cart, cartProducts: [...state.cart.cartProducts, action.payload] } }
        : state;
    case "UPDATE_ITEM":
      return state.cart
        ? {
          ...state,
          cart: {
            ...state.cart,
            cartProducts: state.cart.cartProducts.map((product) =>
              product.systemProduct.id === action.payload.systemProduct.id ? action.payload : product
            ),
          },
        }
        : state;
    case "REMOVE_ITEM":
      return state.cart
        ? {
          ...state,
          cart: { ...state.cart, cartProducts: state.cart.cartProducts.filter((product) => product?.id !== action.payload) },
        }
        : state;
    case "FINALIZE_PURCHASE":
      return state.cart
        ? { ...state, cart: { ...state.cart, cartProducts: [] } }
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
export const useShoppingCart = () => {
  let { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const [state, dispatch] = useReducer<React.Reducer<ShoppingCartState, ShoppingCartAction>>(
    shoppingCartReducer,
    initialState
  );
  const hasFetched = useRef(false); // Controle de execução

  useEffect(() => {
    const fetchData = async () => {
      if (!hasFetched.current && user && id) {
        hasFetched.current = true; // Marca como executado
        try {
          const cart = await loadCartFromShoppingList(parseInt(id))
          const productIds: number[] = cart.cartProducts.map((item) => item.systemProductId ?? 0);
          const productsWithDetails = await fetchProductsWithDetailsByIds(productIds);

          const updatedProducts = cart.cartProducts.map((item) => ({
            ...item,
            systemProduct: productsWithDetails.find((product) => product.id === item.systemProductId) || {} as Product
          }));

          const updatedCartWithUnitPrice: ShoppingCart = {
            ...cart,
            cartProducts: updatedProducts
          };

          dispatch({ type: "SET_CART", payload: updatedCartWithUnitPrice });

        }
        catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
          dispatch({ type: "SET_ERROR", payload: errorMessage });
        }
      }
    }

    fetchData();
  }, [user, id, dispatch]);

  const transformCartResponse = (apiResponse: any): ShoppingCart => {
    return {
        id: apiResponse.id,
        pantryId: apiResponse.pantryId ?? undefined,
        createdAt: apiResponse.createdAt,
        cartProducts: apiResponse.products.map((product: any) => ({
            id: product.id,
            systemProductId: product.systemProduct.id,
            systemProduct: {
                ...product.systemProduct,
                variety: {
                    ...product.systemProduct.variety,
                    ingredient: { ...product.systemProduct.variety.ingredient }
                }
            },
            plannedQuantity: product.plannedQuantity ?? null, // Default para 0 se for null
            plannedUnit: product.plannedUnit ?? "Unidade", // Default para "Unidade"
            purchasedQuantity: product.purchasedQuantity,
            purchasedUnit: product.purchasedUnit,
            unitPrice: product.unitPrice,
            totalPrice: product.totalPrice,
        })),
    };
};


  const handleAddToCart = async (data: ShoppingCartProductInsert[]) => {
    if (id) {
      try {      
        const apiResponse = await addProductToShoppingCart(parseInt(id), data);
        const updatedCart = transformCartResponse(apiResponse);

        dispatch({ type: "SET_CART", payload: updatedCart });
      } catch (error: unknown) {
        console.error("Erro ao adicionar itens ao carrinho:", error);
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
      }
    }
  };


  const handleUpdateCartProduct = async (data: ShoppingCartProduct) => {
    if (id) {
      try {
        const apiResponse  = await updateShoppingCartProduct(parseInt(id), data.id, data);
        const updatedCart = transformCartResponse(apiResponse); // Converte para ShoppingCart

        dispatch({ type: "SET_CART", payload: updatedCart });
      } catch (error: unknown) {
        console.error("Erro ao atualizar product:", error);
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
      }
    }
  };


  const handleRemoveCartProduct = async (cartProductId: number) => {
    if (id) {
      try {
        await removeShoppingCartProduct(parseInt(id), cartProductId);
        dispatch({ type: "REMOVE_ITEM", payload: cartProductId });
      } catch (error: unknown) {
        console.error("Erro ao remover product:", error);
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
      }
    }
  };

  const handleFinalizePurchase = async () => {
    if (id) {
      try {
        await finalizePurchase(parseInt(id));
        dispatch({ type: "FINALIZE_PURCHASE" });
      } catch (error: unknown) {
        console.error("Erro ao finalizar a compra:", error);
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        dispatch({ type: "SET_ERROR", payload: errorMessage });
      }
    }
  };

  return {
    cart: state.cart,
    loading: state.loading,
    error: state.error,
    handleAddToCart,
    handleUpdateCartProduct,
    handleRemoveCartProduct,
    handleFinalizePurchase,
  };
};
