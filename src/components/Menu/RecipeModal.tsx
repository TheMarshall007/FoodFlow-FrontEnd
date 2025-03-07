import React, { useEffect, useState } from 'react';
import { fetchIngredientsByIds } from '../../services/ingredients/ingredientsService';
import '../../styles/components/Menu/Recipe/RecipeModal.css';
import { Dish } from '../../services/dish/dishService';

interface RecipeModalProps {
    show: boolean;
    onClose: () => void;
    dish: Dish;
}

interface Ingredient {
    id: number;
    name: string;
    description: string;
    quantity: number;
    unit: string
}

const RecipeModal: React.FC<RecipeModalProps> = ({ show, onClose, dish }) => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);

    useEffect(() => {
        async function fetchData() {
            if(dish.ingredients){
                const ing = dish.ingredients.map((ingredient) => {
                    return {
                        id: ingredient.systemIngredientId,
                        name: ingredient.systemIngredient.name,
                        description: ingredient.systemIngredient.description,
                        quantity: ingredient.quantity,
                        unit: ingredient.unit
                    } as Ingredient
                });
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
                <h3>Ingredientes</h3>
                 {ingredients.length > 0 ? (
                    <ul>
                        {ingredients?.map((ingredient) => (
                            <li key={ingredient.id}>
                                {ingredient.name}: {ingredient.quantity} {ingredient.unit}
                            </li>
                        ))}
                    </ul>
                ):(
                    <p>Não há ingredientes cadastrados para este prato.</p>
                )}
                
            </div>
        </div>
    );
};

export default RecipeModal;
