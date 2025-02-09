import React, { useEffect, useState } from 'react';
import { fetchIngredientsByIds } from '../../services/ingredients/ingredientsService';
import '../../styles/components/Menu/Recipe/RecipeModal.css';
import { Dish, updateDish } from '../../services/dish/dishService';
import { insertConsumption } from '../../services/consumption/consumptionService';
import { useUser } from '../../context/UserContext';

interface RecipeModalProps {
    show: boolean;
    onClose: () => void;
    dish: Dish;
    pantryId?: number;
    isAdmin?: boolean; // Nova prop para indicar se o modal está em modo admin
}

interface Ingredient {
    id: number;
    name: string;
    description: string;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ show, onClose, dish, pantryId, isAdmin }) => {
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [loading, setLoading] = useState(false);
    const { user } = useUser();

    // Estados para edição
    const [name, setName] = useState(dish.name);
    const [description, setDescription] = useState(dish.description);
    const [image, setImage] = useState<File | null>(null);

    useEffect(() => {
        async function fetchData() {
            const ing = await fetchIngredientsByIds(dish.ingredientsId);
            setIngredients(ing);
        }
        fetchData();
    }, [dish]);

    // Função para editar o prato
    const handleUpdateDish = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            if (image) formData.append("image", image);

            await updateDish(formData);
            alert("Prato atualizado com sucesso!");
            onClose();
        } catch (error) {
            alert("Erro ao atualizar prato.");
        }
        setLoading(false);
    };

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
        } else {
            alert("Você precisa ter uma despensa vinculada ao menu para marcar os pratos como consumido");
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>X</button>
                
                {/* Se estiver no modo admin, permitir edição */}
                {isAdmin ? (
                    <>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="edit-input"
                        />
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="edit-textarea"
                        />
                        <input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} />
                        <button className="save-button" onClick={handleUpdateDish} disabled={loading}>
                            {loading ? "Salvando..." : "Salvar Alterações"}
                        </button>
                    </>
                ) : (
                    <>
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
                        <ul>
                            {ingredients?.map((ingredient) => (
                                <li key={ingredient.id}>{ingredient.name}</li>
                            ))}
                        </ul>
                        <button
                            className="mark-done-button"
                            onClick={handleMarkAsDone}
                            disabled={loading}
                        >
                            {loading ? "Processando..." : "Marcar como feito"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default RecipeModal;
