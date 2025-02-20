import { useEffect, useReducer, useRef } from "react";
import { fetchPantry, fetchLowQuantityProducts, PantryProduct, Pantry, PantryInsertData, createPantry } from "../../services/pantry/pantryService";
import { fetchMenusCountByPantry } from "../../services/menu/menuService";
import { useUser } from "../../context/UserContext";

export const initialState = {
    pantries: [] as Pantry[],
    loading: false,
}

type Action =
    | { type: "SET_PANTRIES"; payload: Pantry[] }
    | { type: "SET_LOADING"; payload: boolean }

export function pantryReducer(state: typeof initialState, action: Action) {
    switch (action.type) {
        case "SET_PANTRIES": return { ...state, pantries: action.payload, loading: false };
        case "SET_LOADING": return { ...state, loading: action.payload };
        default: return state;
    }
};

export const usePantry = () => {
    const { user } = useUser();
    const [state, dispatch] = useReducer(pantryReducer, {
        pantries: [],
        loading: true,
    });
    const hasFetched = useRef(false); // Controle de execução

    useEffect(() => {
        async function fetchData() {
            if (!hasFetched.current && user) {
                dispatch({ type: "SET_LOADING", payload: true });
                hasFetched.current = true; // Marca como executado
                try {
                    const pant = await fetchPantry({ userId: user.id, page: 0 });
                    const pantryWithDetails = await Promise.all(pant.map(async (invent: PantryProduct) => {
                        const lowProduct = await fetchLowQuantityProducts(invent.id, 5);
                        const menuCount = await fetchMenusCountByPantry(invent.id);
                        return { ...invent, lowQuantityProducts: lowProduct, menuCount };
                    }));

                    dispatch({ type: "SET_PANTRIES", payload: pantryWithDetails });
                } catch (error) {
                    console.log("Erro ao carregar despensas");
                }
            }
        }

        fetchData();
    }, [user]);


    const handleCreatePantry = async (pantryData: PantryInsertData) => {
        dispatch({ type: "SET_LOADING", payload: true });
        try {
            let newPantry = await createPantry(pantryData);
            const lowProduct: [] = []
            const menuCount = 0        
            newPantry = { ...newPantry, lowQuantityProducts: lowProduct, menuCount };
            dispatch({ type: "SET_PANTRIES", payload: [...state.pantries, newPantry] });
        } catch (error) {
            console.error("Erro ao criar a despensa:", error);
        }
    }

    return { state, handleCreatePantry };
}
