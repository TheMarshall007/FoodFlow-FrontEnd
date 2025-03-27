import { useEffect, useReducer, useRef } from "react";
import { fetchProducts, Product } from "../services/product/productService";
import {
    addProductToShoppingList,
    fetchShoppingList,
    removeProductFromShoppingList,
    ShoppingList,
    ShoppingListProductInsert,
    updateProductQuantityInShoppingList,
} from "../services/shopping/shoppingListService";
import { useParams } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { Ingredient } from "../services/ingredients/ingredientsService";

interface ProductState {
    systemProduct: Product[];
    shoppingList: ShoppingList;
    loading: boolean;
    error: string | null;
}

type ProductAction =
    | { type: "SET_PRODUCTS"; payload: Product[] }
    | { type: "SET_SHOPPING_LIST"; payload: ShoppingList }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_ERROR"; payload: string | null };

const productReducer = (state: ProductState, action: ProductAction): ProductState => {
    switch (action.type) {
        case "SET_PRODUCTS":
            return { ...state, systemProduct: action.payload, loading: false };
        case "SET_SHOPPING_LIST":
            return { ...state, shoppingList: action.payload };
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        case "SET_ERROR":
            return { ...state, error: action.payload, loading: false };
        default:
            return state;
    }
};

export const useProduct = () => {
    let { id } = useParams<{ id: string }>();
    const { user } = useUser();
    const [state, dispatch] = useReducer(productReducer, {
        systemProduct: [],
        shoppingList: { products: [], pantryId: 0 },
        loading: true,
        error: null,
    });
    const hasFetched = useRef(false); // Controle de execução

    useEffect(() => {
        const fetchData = async () => {
            if (!hasFetched.current && user && id) {
                hasFetched.current = true; // Marca como executado
                try {
                    // Fetch products with details (including ingredient info)
                    let products = await (await fetchProducts({ page: 0 })).content;
                    
                    dispatch({ type: "SET_PRODUCTS", payload: products });

                    // If a pantryId was passed, fetch the shopping list for that pantry
                    const shoppingListData = await fetchShoppingList(parseInt(id));
                    dispatch({ type: "SET_SHOPPING_LIST", payload: shoppingListData });
                } catch (error) {
                    dispatch({ type: "SET_ERROR", payload: "Erro ao carregar produtos e lista de compras" });
                }
            }
        };
        fetchData();
    }, [id, user]);

    const handleSearch = async () => {
        dispatch({ type: "SET_LOADING", payload: true });
        try {
            const productData = await fetchProducts({ page: 0 });
            dispatch({ type: "SET_PRODUCTS", payload: productData.content });
        } catch (error) {
            dispatch({ type: "SET_ERROR", payload: "Erro ao buscar produtos" });
        }
    };

    // TODO - adicionar a inserção de produtos quando admim
    const handleAddProduct = async (newProduct: { brand: string; quantityPerUnit: number; unit: string }) => {
        try {
            // const addedProduct = await createProduct(newProduct);
            // dispatch({ type: "ADD_PRODUCT", payload: addedProduct });
        } catch (error) {
            console.error("Erro ao adicionar produto:", error);
        }
    };

    const handleAddProductToShoppingList = async (product: ShoppingListProductInsert) => {
        if (id && user) {
            try {
                // 🔥 Calls the endpoint and gets the updated list
                const updatedShoppingList = await addProductToShoppingList({ pantryId: parseInt(id), product });

                // 🔥 Updates the state with the complete shopping list returned by the API
                dispatch({ type: "SET_SHOPPING_LIST", payload: updatedShoppingList });
            } catch (error) {
                console.error("Erro ao adicionar produto à lista de compras:", error);
            }
        }
    };

    const handleUpdateQuantity = async (productId: number, newQuantity: number) => {
        if (id && user) {
            try {
                const updatedShoppingList = await updateProductQuantityInShoppingList(
                    parseInt(id),
                    productId,
                    newQuantity
                );
                dispatch({ type: "SET_SHOPPING_LIST", payload: updatedShoppingList });
            } catch (error) {
                console.error("Erro ao atualizar a quantidade do product:", error);
                alert("Erro ao atualizar a quantidade. Tente novamente.");
            }
        }
    };

    const handleRemoveProductFromShoppingList = async (itemId: number) => {
        if (id && user) {
            try {
                const updatedShoppingList = await removeProductFromShoppingList(parseInt(id), itemId);
                dispatch({ type: "SET_SHOPPING_LIST", payload: updatedShoppingList });
            } catch (error) {
                console.error("Erro ao remover item da lista de compras:", error);
                alert("Erro ao remover item. Tente novamente.");
            }
        }
    };

    return {
        state,
        handleSearch,
        handleAddProduct,
        handleAddProductToShoppingList,
        handleUpdateQuantity,
        handleRemoveProductFromShoppingList,
    };
};
