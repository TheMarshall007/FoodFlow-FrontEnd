import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pages/Menu/Menus.css";
import { useMenu } from "../../hooks/Menu/useMenu";
import MenuForm from "./MenuForm";

const Menus = () => {
    const { state } = useMenu();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state.menus) {
        return <p>Carregando ou despensa não encontrada...</p>;
    }
    return (
        <div className="menu-section">
            <h2>Meus Menus</h2>
            <h4 className="add-button" onClick={() => setIsModalOpen(true)}>Adicionar</h4>

            {state.menus.length === 0 ? (
                <p>Nenhum menu encontrado.</p>
            ) : (
                <div className="menu-cards">
                    {state.menus.map((menu) => (
                        <div key={menu.id} className="menu-card" onClick={() => navigate(`/menu/${menu.id}`)}>
                            <h3>{menu.name}</h3>
                            <p>{menu.description}</p>
                        </div>
                    ))}
                </div>
            )}
            {/* Modal para adicionar novo menu */}
            <MenuForm isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

        </div>

    );
};

export default Menus;
