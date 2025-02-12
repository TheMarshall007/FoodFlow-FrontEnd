import { useEffect, useReducer } from "react";
import { fetchProducts, Product } from "../services/product/productService";
import { addProductToShoppingList, fetchShoppingList, removeProductFromShoppingList, ShoppingList, ShoppingListProductInsert, updateProductQuantityInShoppingList } from "../services/shopping/shoppingListService";
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
            const updatedProducts = state.shoppingList.items.map((item) =>
                item.productId === action.payload.productId ? { ...item, quantity: action.payload.quantity } : item
            );

            // Se o item não existe na lista e a quantidade for maior que 0, adicionamos
            if (!updatedProducts.find((item) => item.productId === action.payload.productId) && action.payload.quantity > 0) {
                const product = state.products.find((p) => p.id === action.payload.productId);

                updatedProducts.push({
                    id: Date.now(), // Criamos um ID temporário
                    productId: action.payload.productId,
                    name: product ? product.brand : "Produto Desconhecido", // Pegamos o nome da marca ou um valor padrão
                    quantity: action.payload.quantity,
                });
            }

            return { ...state, shoppingList: { ...state.shoppingList, items: updatedProducts } };
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
                if (id) {
                    const pantryId = parseInt(id);
                    const shoppingListData = await fetchShoppingList(pantryId);
                    dispatch({ type: "SET_SHOPPING_LIST", payload: shoppingListData });
                }
            } catch (error) {
                dispatch({ type: "SET_ERROR", payload: "Erro ao carregar produtos e lista de compras" });
            }
        }
        loadProducts();
    }, [id]);

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

    const handleAddProductToShoppingList = async (product: ShoppingListProductInsert) => {
        if (id && user) {
            const pantryId = parseInt(id);
            try {
                // 🔥 Chama o endpoint e obtém a lista atualizada
                const updatedShoppingList = await addProductToShoppingList({ pantryId, product });
    
                // 🔥 Atualiza o estado com a lista de compras completa retornada pela API
                dispatch({ type: "SET_SHOPPING_LIST", payload: updatedShoppingList });
            } catch (error) {
                console.error("Erro ao adicionar produto à lista de compras:", error);
            }
        }
    };
    

    const handleUpdateQuantity = async (productId: number, newQuantity: number) => {
        if (id && user) {
            const pantryId = parseInt(id);
            try {
                const updatedShoppingList = await updateProductQuantityInShoppingList(pantryId, productId, newQuantity);
                dispatch({ type: "UPDATE_SHOPPING_LIST", payload: updatedShoppingList });
            } catch (error) {
                console.error("Erro ao atualizar a quantidade do product:", error);
                alert("Erro ao atualizar a quantidade. Tente novamente.");
            }
        }
    };

    const handleRemoveProduct = async (itemId: number) => {
        if (id && user) {
            const pantryId = parseInt(id);
            try {
                const updatedShoppingList = await removeProductFromShoppingList(pantryId, itemId);
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
        handleAddProductToShoppingList,handleUpdateQuantity, handleRemoveProduct
    };
};
