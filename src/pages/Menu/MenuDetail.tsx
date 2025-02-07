import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pages/Menu/MenuDetail.css";
import { useMenuDetail } from "../../hooks/Menu/useMenuDetail";
import { Dish } from "../../services/dish/dishService";
import RecipeModal from "../../components/Menu/RecipeModal";
import SelectDishesModal from "../../components/Menu/SelectDishesModal";

const MenuDetail: React.FC = () => {
    const { state, dispatch, handleAddDishes } = useMenuDetail();
    const navigate = useNavigate();

    const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
    const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
    const [isSelectDishesModalOpen, setIsSelectDishesModalOpen] = useState(false);

    const handleOpenRecipeModal = (dish: Dish) => {
        setSelectedDish(dish);
        setIsRecipeModalOpen(true);
    };

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

            {/* Botão para adicionar pratos */}
            <button className="add-dishes-button" onClick={() => setIsSelectDishesModalOpen(true)}>
                Adicionar Pratos
            </button>

            {/* Lista de pratos */}
            <div className="tab-dishes">
                <div className="dishes-grid">
                    {state.menu?.dishes?.map((dish) => (
                        <div key={dish.id} className="dish-card" onClick={() => handleOpenRecipeModal(dish)}>
                            {/* <img 
                                src={dish.image || "/assets/fotos/default-item.png"} 
                                alt={dish.name} 
                                className="dish-card-image" 
                            /> */}
                            <div className="dish-card-info">
                                <h4>{dish.name}</h4>
                                <p>{dish.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Botão para voltar */}
            <button className="back-button" onClick={() => navigate("/menus")}>Voltar</button>

            {/* Modal de Receita */}
            {selectedDish && (
                <RecipeModal
                    show={isRecipeModalOpen}
                    onClose={() => setIsRecipeModalOpen(false)}
                    dish={selectedDish}
                />
            )}

            {/* Modal de Seleção de Pratos */}
            <SelectDishesModal
                show={isSelectDishesModalOpen}
                onClose={() => setIsSelectDishesModalOpen(false)}
                onConfirm={handleAddDishes}
                existingDishes={state.menu.dishes}
            />
        </div>
    );
};

export default MenuDetail;
