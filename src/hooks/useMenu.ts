import { useEffect, useReducer, useRef } from "react";
import { useParams } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { addDishesToMenu, createMenu, getMenuById, getMenusPaginated, Menu } from "../services/menu/menuService";

export const initialState = {
    menus: [] as Menu[],
    selectedMenu: null,
    loading: false,
    error: null,
};

type Action =
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_MENUS"; payload: Menu[] }
    | { type: "SET_ERROR"; payload: Menu }
    | { type: "SET_SELECTED_MENU"; payload: Menu }

export function menuReducer(state: typeof initialState, action: Action) {
    switch (action.type) {
        case "SET_LOADING": return { ...state, loading: true, error: null };
        case "SET_ERROR": return { ...state, loading: false, error: action.payload };
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
            if (!hasFetched.current && user && id) {
                hasFetched.current = true; // Marca como executado
                try {
                    const response = await getMenusPaginated({ userId: user.id, page: 0 });
                    dispatch({ type: "SET_MENUS", payload: response.items || [] });
                } catch (error) {
                    dispatch({ type: "SET_ERROR", payload: "Erro ao carregar menus" });
                }
            }
        };

        fetchData();
    }, [user, id, dispatch]);

    const fetchMenuById = async () => {
        dispatch({ type: "SET_LOADING" });
        try {
            const menu = await getMenuById(parseInt(id));
            dispatch({ type: "SET_SELECTED_MENU", payload: menu });
        } catch (error) {
            dispatch({ type: "SET_ERROR", payload: "Erro ao carregar menu" });
        }
    };

    const handleCreateMenu = async (menuData: Menu) => {
        dispatch({ type: "SET_LOADING" });
        try {
            const newMenu = await createMenu(menuData);
            dispatch({ type: "SET_MENUS", payload: [...state.menus, newMenu] });
        } catch (error) {
            dispatch({ type: "SET_ERROR", payload: "Erro ao criar menu" });
        }
    };

    const handleAddDishes = async (dishIds: number[]) => {
        dispatch({ type: "SET_LOADING" });
        try {
            const updatedMenu = await addDishesToMenu(parseInt(id), dishIds);
            dispatch({ type: "SET_SELECTED_MENU", payload: updatedMenu });
        } catch (error) {
            dispatch({ type: "SET_ERROR", payload: "Erro ao adicionar pratos ao menu" });
        }
    };

    return { state, dispatch, fetchMenuById, handleCreateMenu, handleAddDishes };
};