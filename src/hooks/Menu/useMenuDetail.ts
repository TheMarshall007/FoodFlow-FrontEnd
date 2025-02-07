import { useEffect, useReducer, useRef } from "react";
import { useParams } from "react-router-dom";
import { addDishesToMenu, getMenuById, Menu } from "../../services/menu/menuService";
import { fetchDishesByIds } from "../../services/dish/dishService";

export const initialState = {
    menu: {} as Menu,
    selectedMenu: null as Menu | null,
    loading: false,
};

type Action =
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_MENU"; payload: Menu }
    | { type: "SET_SELECTED_MENU"; payload: Menu }


export function menuReducer(state: typeof initialState, action: Action) {
    switch (action.type) {
        case "SET_LOADING": return { ...state, loading: true, error: null };
        case "SET_MENU": return { ...state, loading: false, menu: action.payload };
        case "SET_SELECTED_MENU": return { ...state, loading: false, selectedMenu: action.payload };
        default: return state;
    }
};

export const useMenuDetail = () => {
    const { id } = useParams<{ id: string }>();
    const [state, dispatch] = useReducer(menuReducer, initialState);
    const hasFetched = useRef(false); // Controle de execução

    useEffect(() => {
        async function fetchData() {
            if (!hasFetched.current && id) {
                hasFetched.current = true; // Marca como executado
                try {
                    const menu = await getMenuById(parseInt(id));
                    menu.dishes = await fetchDishesByIds( menu.dishesId);
                    dispatch({ type: "SET_MENU", payload: menu  });
                } catch (error) {
                    console.error("Erro ao buscar o menu:", error);
                }
            }
        };

        fetchData();
    }, [id, dispatch]);

    const handleAddDishes = async (dishIds: number[]) => {
        if (id) {
            dispatch({ type: "SET_LOADING", payload: true });
            try {
                const updatedMenu = await addDishesToMenu(parseInt(id), dishIds);                
                updatedMenu.dishes = await fetchDishesByIds( updatedMenu.dishesId);
                dispatch({ type: "SET_MENU", payload: updatedMenu });
            } catch (error) {
                console.error("Erro ao adicionar pratos ao menu:", error);
            }
        }
    };

    return { state, dispatch, handleAddDishes };
};