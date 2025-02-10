import { useEffect, useReducer } from "react";
import { fetchProducts, Product } from "../services/product/productService";
import { addProductToShoppingList, fetchShoppingList, removeItemFromShoppingList, ShoppingList, ShoppingListItemInsert, updateItemQuantityInShoppingList } from "../services/shopping/shoppingListService";
import { useParams } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { updateShoppingListWithProductNames } from "../utils/shoppingListUtils";

interface ProductState {
    products: Product[];
    shoppingList: ShoppingList;
    loading: boolean;
    error: string | null;
}

type ProductAction =
    | { type: "SET_PRODUCTS"; payload: Product[] }
    | { type: "SET_SHOPPING_LIST"; payload: ShoppingList }
    | { type: "UPDATE_SHOPPING_LIST"; payload: { productId: number; quantity: number } }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_ERROR"; payload: string | null };

const productReducer = (state: ProductState, action: ProductAction): ProductState => {
    switch (action.type) {
        case "SET_PRODUCTS":
            return { ...state, products: action.payload, loading: false };
        case "SET_SHOPPING_LIST":
            return { ...state, shoppingList: action.payload };
        case "UPDATE_SHOPPING_LIST":
            const updatedItems = state.shoppingList.items.map((item) =>
                item.productId === action.payload.productId ? { ...item, quantity: action.payload.quantity } : item
            );

            // Se o item não existe na lista e a quantidade for maior que 0, adicionamos
            if (!updatedItems.find((item) => item.productId === action.payload.productId) && action.payload.quantity > 0) {
                const product = state.products.find((p) => p.id === action.payload.productId);

                updatedItems.push({
                    id: Date.now(), // Criamos um ID temporário
                    productId: action.payload.productId,
                    name: product ? product.brand : "Produto Desconhecido", // Pegamos o nome da marca ou um valor padrão
                    quantity: action.payload.quantity,
                });
            }

            return { ...state, shoppingList: { ...state.shoppingList, items: updatedItems } };
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        case "SET_ERROR":
            return { ...state, error: action.payload, loading: false };
        default:
            return state;
    }
};

export const useProduct = () => {
    const { id } = useParams<{ id: string }>();
    const pantryId = id && parseInt(id);
    const { user } = useUser();
    const [state, dispatch] = useReducer(productReducer, {
        products: [],
        shoppingList: { items: [], pantryId: 0 },
        loading: true,
        error: null,
    });

    useEffect(() => {
        async function loadProducts() {
            dispatch({ type: "SET_LOADING", payload: true });
            try {
                const productData = await fetchProducts({ page: 0 });
                dispatch({ type: "SET_PRODUCTS", payload: productData.content });

                // Se um pantryId foi passado, buscar a lista de compras dessa despensa
                if (pantryId) {
                    const shoppingListData = await fetchShoppingList(pantryId);
                    dispatch({ type: "SET_SHOPPING_LIST", payload: shoppingListData });
                }
            } catch (error) {
                dispatch({ type: "SET_ERROR", payload: "Erro ao carregar produtos e lista de compras" });
            }
        }
        loadProducts();
    }, [pantryId]);

    const handleSearch = async () => {
        dispatch({ type: "SET_LOADING", payload: true });
        try {
            const productData = await fetchProducts({ page: 0 });
            dispatch({ type: "SET_PRODUCTS", payload: productData.content });
        } catch (error) {
            dispatch({ type: "SET_ERROR", payload: "Erro ao buscar produtos" });
        }
    };

    //TODO - adicionar a inserção de produtos quando admim
    const handleAddProduct = async (newProduct: { brand: string; quantityPerUnit: number; unit: string }) => {
        try {
            // const addedProduct = await createProduct(newProduct);
            // dispatch({ type: "ADD_PRODUCT", payload: addedProduct });
        } catch (error) {
            console.error("Erro ao adicionar produto:", error);
        }
    };

    const handleAddItemToShoppingList = async (item: ShoppingListItemInsert) => {
        if (pantryId && user) {
            try {
                await addProductToShoppingList({ pantryId: pantryId, item });
                dispatch({ type: "UPDATE_SHOPPING_LIST", payload: item });
            } catch (error) {
                console.error("Erro ao adicionar produto à lista de compras:", error);
            }
        }
    };

    const handleUpdateQuantity = async (productId: number, newQuantity: number) => {
        if (id && user) {
            try {
                const updatedShoppingList = await updateItemQuantityInShoppingList(parseInt(id), productId, newQuantity);
                dispatch({ type: "UPDATE_SHOPPING_LIST", payload: updatedShoppingList });
            } catch (error) {
                console.error("Erro ao atualizar a quantidade do item:", error);
                alert("Erro ao atualizar a quantidade. Tente novamente.");
            }
        }
    };

    const handleRemoveItem = async (itemId: number) => {
        if (pantryId && user) {
            try {
                const updatedShoppingList = await removeItemFromShoppingList(pantryId, itemId);
                dispatch({ type: 'UPDATE_SHOPPING_LIST', payload: updatedShoppingList });
            } catch (error) {
                console.error('Erro ao remover item da lista de compras:', error);
                alert('Erro ao remover item. Tente novamente.');
            }
        }
    };

    return {
        state,
        handleSearch,
        handleAddProduct,
        handleAddItemToShoppingList,handleUpdateQuantity, handleRemoveItem
    };
};
