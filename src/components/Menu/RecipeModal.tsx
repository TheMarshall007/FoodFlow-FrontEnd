import React, { useEffect, useState } from 'react';
import '../../styles/components/Menu/Recipe/RecipeModal.css';
import { Dish } from '../../services/dish/dishService';
import { Ingredient } from '../../services/ingredients/ingredientsService';

interface RecipeModalProps {
    show: boolean;
    onClose: () => void;
    dish: Dish;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ show, onClose, dish }) => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);

    useEffect(() => {
        async function fetchData() {
            if (dish.ingredients) {
                const ing = dish.ingredients.map((ingredient) => ({
                    id: ingredient.systemIngredientId,
                    name: ingredient.systemIngredient.name,
                    category: ingredient.systemIngredient.category,
                    type: ingredient.systemIngredient.type,
                    isValidated: ingredient.systemIngredient.isValidated,
                    quantity: ingredient.quantity,
                    unit: ingredient.unit
                }));
                setIngredients(ing);
            }
        }
        fetchData();
    }, [dish]);

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>X</button>
                <h2>{dish.name}</h2>
                {dish.image && (
                    <img
                        src={`data:image/${dish.image.type};base64,${dish.image.image}`}
                        alt={dish.name}
                        className="dish-card-image"
                    />
                )}
                <p>{dish.description}</p>
                <h3>Ingredients</h3>
                {ingredients.length > 0 ? (
                    <ul>
                        {ingredients.map((ingredient) => (
                            <li key={ingredient.id}>
                                {ingredient.name}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No ingredients registered for this dish.</p>
                )}
            </div>
        </div>
    );
};

export default RecipeModal;
