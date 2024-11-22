import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { fetchShoppingList } from "../../services/shoppingListService";

const ShoppingList: React.FC = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [shoppingList, setShoppingList] = useState()


    useEffect(() => {
        const fetchData = async () => {
            if (user?.id) {
                const shoppingList = await fetchShoppingList({ userId: user.id, page: 0 })
                setShoppingList(shoppingList)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="menu-section">
            <h2>Listas de Compras</h2>
            <h4 className='add-button' onClick={() => navigate("/shopping/form")}>Adicionar</h4>
        </div>
    )
}

export default ShoppingList;