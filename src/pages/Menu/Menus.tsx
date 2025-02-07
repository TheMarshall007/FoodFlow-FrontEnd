import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import "../../styles/pages/Menu/Menus.css";
import { getMenusPaginated, Menu } from "../../services/menu/menuService";

const Menus = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const hasFetched = useRef(false);

    useEffect(() => {
        async function fetchData() {
            if (!hasFetched.current && user) {
                hasFetched.current = true;
                try {
                    const response = await getMenusPaginated({ userId: user.id, page: 0 });
                    console.log("LOGG RE", response)
                    setMenus(response || []);
                } catch (error) {
                    console.error("Erro ao buscar menus:", error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchData();
    }, [user]);

    return (
        <div className="menu-section">
            <h2>Meus Menus</h2>
            <h4 className="add-button" onClick={() => navigate("/menu/create")}>
                Adicionar
            </h4>

            {loading ? (
                <p>Carregando menus...</p>
            ) : menus.length === 0 ? (
                <p>Nenhum menu encontrado.</p>
            ) : (
                <div className="menu-cards">
                    {menus.map((menu) => (
                        <div key={menu.id} className="menu-card" onClick={() => navigate(`/menu/${menu.id}`)}>
                            <h3>{menu.name}</h3>
                            <p>{menu.description}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Menus;
