import { useEffect, useReducer, useRef } from "react";
import {
  fetchShoppingCart,
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
import { fetchProductsByIds, Product } from "../services/product/productService";
import { fetchVarietyByIds, Variety } from "../services/variety/varietyService";
import { updateShoppingListWithProductNames } from "../utils/shoppingListUtils";

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
        ? { ...state, cart: { ...state.cart, products: [...state.cart.products, action.payload] } }
        : state;
    case "UPDATE_ITEM":
      return state.cart
        ? {
          ...state,
          cart: {
            ...state.cart,
            products: state.cart.products.map((product) =>
              product.product.id === action.payload.product.id ? action.payload : product
            ),
          },
        }
        : state;
    case "REMOVE_ITEM":
      return state.cart
        ? {
          ...state,
          cart: { ...state.cart, products: state.cart.products.filter((product) => product?.product?.id !== action.payload) },
        }
        : state;
    case "FINALIZE_PURCHASE":
      return state.cart
        ? { ...state, cart: { ...state.cart, products: [] } }
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
      if (!hasFetched.current && user && pantryId) {
        hasFetched.current = true; // Marca como executado
        try {
          const cart = await loadCartFromShoppingList(pantryId)
          const productIds = cart.products.map((item) => item.productId);
          let products: Product[] = [];
          let varieties: Variety[] = [];

          if (productIds.length > 0) {
            ({ products, varieties } = await fetchProductsAndVarietiesByIds(productIds));
          }          // Recalcula o valor unitário de todos os itens do carrinho antes de armazená-los no estado

          const updatedProducts = cart.products.map((item) => {
            // Buscar o produto correspondente
            const product = products.find((product) => product.id === item.productId);
        
            // Buscar a variedade correspondente ao produto
            const variety = varieties.find((variety) => variety.id === product?.varietyId);
        
            return {
                ...item,
                name: product ? `${variety?.name} (${product.brand || "Variedade Desconhecida"})` : "Produto Desconhecido",
                unityPrice: item.cartQuantity > 0 ? item.price / item.cartQuantity : 0 // Evita divisão por zero
            };
        });
        
        const updatedCartWithUnitPrice = {
            ...cart,
            products: updatedProducts
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
  }, [user, pantryId, dispatch]);



  const handleAddToCart = async (data: ShoppingListProduct[]) => {
    try {
      // Converte ShoppingListProduct[] para ShoppingCartProduct[]
      const cartProducts: ShoppingCartProductInsert[] = data.map((product) => ({
        productId: product.productId,
        plannedQuantity: 0,
        cartQuantity: product.quantity,
        price: 0
      }));

      // Envia os itens convertidos para o backend
      const updatedCart = await addProductToShoppingCart(pantryId, cartProducts);
      dispatch({ type: "SET_CART", payload: updatedCart });
    } catch (error: unknown) {
      console.error("Erro ao adicionar itens ao carrinho:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
    }
  };


  const handleUpdateCartProduct = async (data: ShoppingCartProduct) => {
    try {
      const updatedCart = await updateShoppingCartProduct(pantryId, data.id, data);

      const updatedCartWithUnitPrice = {
        ...updatedCart,
        products: updatedCart.products.map(product => ({
          ...product,
          unityPrice: product.cartQuantity > 0 ? product.price / product.cartQuantity : 0 // Evita divisão por zero
        }))
      };

      dispatch({ type: "SET_CART", payload: updatedCartWithUnitPrice });
    } catch (error: unknown) {
      console.error("Erro ao atualizar product:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      dispatch({ type: "SET_ERROR", payload: errorMessage });
    }
  };


  const handleRemoveCartProduct = async (cartProductId: number) => {
    try {
      await removeShoppingCartProduct(pantryId, cartProductId);
      dispatch({ type: "REMOVE_ITEM", payload: cartProductId });
    } catch (error: unknown) {
      console.error("Erro ao remover product:", error);
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
    handleUpdateCartProduct,
    handleRemoveCartProduct,
    handleFinalizePurchase,
  };
};
