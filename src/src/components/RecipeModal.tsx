// src/components/RecipeModal.tsx
import React, { useEffect, useState } from 'react';
import { fetchIngredientsByIds } from '../../services/ingredientsService';
import './RecipeModal.css';

interface RecipeModalProps {
    show: boolean;
    onClose: () => void;
    name: string;
    description: string;
    ingredientsId: number[];
    steps: string[];
}

interface Ingredient {
    id: number;
    name: string;
    description: string;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ show, onClose, name, description, ingredientsId, steps }) => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);

    useEffect(() => {
        async function fetchData() {
            const ing = await fetchIngredientsByIds(ingredientsId);
            setIngredients(ing);
        }
        fetchData();
    }, [ingredientsId]);

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>X</button>
                <h2>{name}</h2>
                <p>{description}</p>
                <h3>Ingredientes</h3>
                <ul>
                    {ingredients?.map((ingredient) => (
                        <li key={ingredient.id}>{ingredient.name}</li>
                    ))}
                </ul>
                <h3>Passo a Passo</h3>
                <ol>
                    {steps?.map((step, index) => (
                        <li key={index}>{step}</li>
                    ))}
                </ol>
            </div>
        </div>
    );
};

export default RecipeModal;
