// src/components/RecipeModal.tsx
import React, { useEffect, useState } from 'react';
import { fetchIngredientsByIds } from '../../services/ingredients/ingredientsService';
import '../../styles/components/Menu/Recipe/RecipeModal.css';
import { Dish } from '../../services/dish/dishService';

interface RecipeModalProps {
    show: boolean;
    onClose: () => void;
    dish: Dish
}

interface Ingredient {
    id: number;
    name: string;
    description: string;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ show, onClose, dish }) => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);

    useEffect(() => {
        async function fetchData() {
            const ing = await fetchIngredientsByIds(dish.ingredientsId);
            setIngredients(ing);
        }
        fetchData();
    }, [dish]);

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>X</button>
                <h2>{dish.name}</h2>
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
                    ))}
                </ol> */}
            </div>
        </div>
    );
};

export default RecipeModal;
