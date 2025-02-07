import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pages/Menu/MenuDetail.css";
import { useMenuDetail } from "../../hooks/Menu/useMenuDetail";

const MenuDetail: React.FC = () => {
    const { state, dispatch } = useMenuDetail();
    const navigate = useNavigate();
    if (!state.menu) {
        return <p>Carregando ou menu não encontrado...</p>;
    }

    return (
        <div className="menu-detail-container">
            <div className="menu-header">
                <div className="menu-info">
                    <h2>{state.menu.name}</h2>
                    <p>{state.menu.description}</p>
                    <p>
                        {state.menu?.pantryId ? `Vinculado à despensa ${state.menu?.pantryId}` : "Nenhuma despensa vinculada"}
                    </p>
                </div>
            </div>
            {/* Conteúdo das abas */}
            <div className="tab-content">
                {/* Lista de pratos */}
                    <div className="tab-dishes">
                        <div className="dishes-grid">
                            {state.menu?.dishes?.map((dish) => (
                                <div key={dish.id} className="dish-card">
                                    {/* <img src={dish.image || "/assets/fotos/default-item.png"} alt={dish.name} className="dish-card-image" /> */}
                                    <div className="dish-card-info">
                                        <h4>{dish.name}</h4>
                                        <p>{dish.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
            </div>

            {/* Botão para voltar */}
            <button className="back-button" onClick={() => navigate("/menus")}>Voltar</button>
        </div>
    );
};

export default MenuDetail;
