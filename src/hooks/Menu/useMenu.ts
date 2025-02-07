import { useEffect, useReducer, useRef } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { addDishesToMenu, createMenu, getMenuById, getMenusPaginated, Menu, MenuInsertData } from "../../services/menu/menuService";

export const initialState = {
    menus: [] as Menu[],
    selectedMenu: null as Menu | null,
    loading: false,
};

type Action =
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_MENUS"; payload: Menu[] }
    | { type: "SET_SELECTED_MENU"; payload: Menu }

export function menuReducer(state: typeof initialState, action: Action) {
    switch (action.type) {
        case "SET_LOADING": return { ...state, loading: true, error: null };
        case "SET_MENUS": return { ...state, loading: false, menus: action.payload };
        case "SET_SELECTED_MENU": return { ...state, loading: false, selectedMenu: action.payload };
        default: return state;
    }
};

export const useMenu = () => {
    const { id } = useParams<{ id: string }>();
    const { user } = useUser();
    const [state, dispatch] = useReducer(menuReducer, initialState);
    const hasFetched = useRef(false); // Controle de execução

    useEffect(() => {
        async function fetchData() {
            if (!hasFetched.current && user) {
                hasFetched.current = true; // Marca como executado
                try {
                    const response = await getMenusPaginated({ userId: user.id, page: 0 });
                    dispatch({ type: "SET_MENUS", payload: response || [] });
                } catch (error) {
                    console.error("Erro ao buscar o menus:", error);
                }
            }
        };

        fetchData();
    }, [user, id, dispatch]);

    const handleCreateMenu = async (menuData: MenuInsertData) => {
        dispatch({ type: "SET_LOADING", payload: true });
        try {
            const newMenu = await createMenu(menuData);
            dispatch({ type: "SET_MENUS", payload: [...state.menus, newMenu] });
        } catch (error) {
            console.error("Erro ao criar o menu:", error);
        }
    };

    return { state, dispatch, handleCreateMenu };
};