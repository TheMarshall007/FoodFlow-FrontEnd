// src/components/RecipeModal.tsx
import React, { useEffect, useState } from 'react';
import { fetchIngredientsByIds } from '../../services/ingredients/ingredientsService';
import '../../styles/components/Menu/Recipe/RecipeModal.css';
import { Dish, markDishAsDone } from '../../services/dish/dishService';
import { insertConsumption } from '../../services/consumption/consumptionService';
import { useUser } from '../../context/UserContext';

interface RecipeModalProps {
    show: boolean;
    onClose: () => void;
    dish: Dish;
    pantryId?: number,
}

interface Ingredient {
    id: number;
    name: string;
    description: string;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ show, onClose, dish, pantryId }) => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useUser()
    useEffect(() => {
        async function fetchData() {
            const ing = await fetchIngredientsByIds(dish.ingredientsId);
            setIngredients(ing);
        }
        fetchData();
    }, [dish]);

    const handleMarkAsDone = async () => {
        if (user && pantryId) {
            setLoading(true);
            try {
                await insertConsumption({
                    userId: user.id,
                    dishId: dish.id,
                    pantryId: pantryId,
                    quantity: 1,
                });
                alert('Consumo registrado com sucesso!');
                onClose();
            } catch (error: any) {
              alert(`Erro: ${error.message}`);
            }
            setLoading(false);
        }else{
            alert("Você precisa ter uma dispensa vinculada ao menu para marcar os pratos como consumido");

        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>X</button>
                <h2>{dish.name}</h2>
                {dish.image && <img
                                src={`data:image/${dish.image.type};base64,${dish.image.image}`}
                                alt={dish.name}
                                className="dish-card-image"
                            />}
                <p>{dish.description}</p>
                <h3>Ingredientes</h3>
                <ul>
                    {ingredients?.map((ingredient) => (
                        <li key={ingredient.id}>{ingredient.name}</li>
                    ))}
                </ul>
                <h3>Passo a Passo</h3>
                {/* <ol>
                    {dish.steps?.map((step, index) => (
                        <li key={index}>{step}</li>
                    ))} */}
                {/* </ol> */}

                <button
                    className="mark-done-button"
                    onClick={handleMarkAsDone}
                    disabled={loading}
                >
                    {loading ? "Processando..." : "Marcar como feito"}
                </button>
            </div>
        </div>
    );
};

export default RecipeModal;
