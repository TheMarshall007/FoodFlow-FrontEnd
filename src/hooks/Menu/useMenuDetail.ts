import { useEffect, useReducer, useRef } from "react";
import { useParams } from "react-router-dom";
import { addDishesToMenu, getMenuById, Menu, updateMenuPantry } from "../../services/menu/menuService";
import { Dish, fetchDishesByIds } from "../../services/dish/dishService";
import { fetchDishImage, Image } from "../../services/dish/dishImageService";
import { fetchPantry, Pantry } from "../../services/pantry/pantryService";

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
                    const dishes = await fetchDishesByIds(menu.dishesId);
                    const dishesImagesIds = dishes
                        .filter((dish: Dish) => dish.image?.id)
                        .map((dish: Dish) => dish.image!.id);

                    const images = await fetchDishImage(dishesImagesIds);
                    // Cria um dicionário para acessar as imagens rapidamente
                    const imagesMap = new Map(images.map((image: Image) => [image.id, image]));
                    const updatedDishes = dishes.map((dish: Dish) => ({
                        ...dish,
                        image: imagesMap.get(dish.image?.id) || dish.image // Mantém a imagem original se não for encontrada
                    }))

                    const pantry: Pantry[] = await fetchPantry({ pantryId: menu.pantryId, page: 0 })
                    menu.pantry = pantry?.[0]
                    menu.dishes = updatedDishes;
                    dispatch({ type: "SET_MENU", payload: menu });
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
                const dishes = await fetchDishesByIds(updatedMenu.dishesId);
                const dishesImagesIds = dishes
                    .filter((dish: Dish) => dish.image?.id)
                    .map((dish: Dish) => dish.image!.id);

                const images = await fetchDishImage(dishesImagesIds);
                // Cria um dicionário para acessar as imagens rapidamente
                const imagesMap = new Map(images.map((image: Image) => [image.id, image]));
                const updatedDishes = dishes.map((dish: Dish) => ({
                    ...dish,
                    image: imagesMap.get(dish.image?.id) || dish.image // Mantém a imagem original se não for encontrada
                }))

                updatedMenu.dishes = updatedDishes;
                dispatch({ type: "SET_MENU", payload: updatedMenu });
            } catch (error) {
                console.error("Erro ao adicionar pratos ao menu:", error);
            }
        }
    };

    const handleUpdatePantry = async (menuId: number, pantryId: number) => {
        try {
            const updatedMenu = await updateMenuPantry(menuId, pantryId);
            const newMenu = { ...state.menu }
            newMenu.pantryId = updatedMenu.pantryId
            const pantry: Pantry[] = await fetchPantry({ pantryId, page: 0 })
            newMenu.pantry = pantry?.[0]
            dispatch({ type: "SET_MENU", payload: newMenu });
        } catch (error) {
            console.error("Erro ao atualizar a despensa do menu:", error);
        }
    };

    return { state, dispatch, handleAddDishes, handleUpdatePantry };
};