import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pages/Menu/MenuDetail.css";
import { useMenuDetail } from "../../hooks/Menu/useMenuDetail";
import { Dish } from "../../services/dish/dishService";
import RecipeModal from "../../components/Menu/RecipeModal";
import SelectDishesModal from "../../components/Menu/SelectDishesModal";
import SelectPantryModal from "../../components/Menu/SelectPantryModal";

const MenuDetail: React.FC = () => {
    const { state, handleAddDishes, handleUpdatePantry } = useMenuDetail();
    const navigate = useNavigate();

    const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
    const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
    const [isSelectDishesModalOpen, setIsSelectDishesModalOpen] = useState(false);
    const [isSelectPantryModalOpen, setIsSelectPantryModalOpen] = useState(false);

    const handleOpenRecipeModal = (dish: Dish) => {
        setSelectedDish(dish);
        setIsRecipeModalOpen(true);
    };

    const handleConfirmPantry = (pantryId: number) => {
        handleUpdatePantry(state.menu.id, pantryId);
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
                        {state.menu?.pantryId ? `Vinculado à despensa ${state.menu?.pantry?.propertyName}` : "Nenhuma despensa vinculada"}
                    </p>
                    <button className="link-pantry-button" onClick={() => setIsSelectPantryModalOpen(true)}>
                        Vincular a uma Despensa
                    </button>
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
                            {dish.image && <img
                                src={`data:image/${dish.image.type};base64,${dish.image.image}`}
                                alt={dish.name}
                                className="dish-card-image"
                            />}
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
                    pantryId={state.menu.pantryId}
                />
            )}

            {/* Modal de Seleção de Pratos */}
            <SelectDishesModal
                show={isSelectDishesModalOpen}
                onClose={() => setIsSelectDishesModalOpen(false)}
                onConfirm={handleAddDishes}
                existingDishes={state.menu.dishes}
            />

            {/* Modal de Seleção de Despensa */}
            <SelectPantryModal
                show={isSelectPantryModalOpen}
                onClose={() => setIsSelectPantryModalOpen(false)}
                onConfirm={handleConfirmPantry}
            />
        </div>
    );
};

export default MenuDetail;
