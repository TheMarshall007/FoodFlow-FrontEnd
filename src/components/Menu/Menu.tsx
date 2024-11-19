import { useEffect, useState } from "react";
import { Dish, fetchDish, fetchDishesByIds } from "../../services/dishService";
import { MenuData } from "../../services/menuService";

interface MenuParams {
    menu: MenuData
}

const Menu = ({ menu }: MenuParams) => {
    const [dishes, setDishes] = useState<Dish[]>([])

    useEffect(() => {
        async function fetchData() {
            if (menu?.dishesId?.length > 0) {
                console.log("LOGG DISHES", menu?.dishesId)
                const fetchedDishes = await fetchDishesByIds(menu.dishesId)
                console.log("LOGG", fetchedDishes)
                setDishes(fetchedDishes);
            }
        }
        fetchData();
    }, [menu]);

    return (
        <div className="dishes-page">
            <div className="dishes-container">
                <h1 className="dishes-title">{menu.name}</h1>
                <div className="dishes-card-container">
                    {dishes?.map((dish, index) => (
                        <div className="dish-card" key={index}>
                            {/* <img src={dish.image} alt={dish.name} className="dish-image" /> */}
                            <h2 className="dish-name">{dish.name}</h2>
                            <p className="dish-type">{dish.type}</p>
                            <p className="dish-price">R$ {dish.price}</p>
                            <button className="dish-button">Adicionar</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Menu;