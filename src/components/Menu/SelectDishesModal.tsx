import React, { useEffect, useState } from "react";
import { fetchDish, fetchDishesByIds } from "../../services/dish/dishService"; // Ajuste para seu serviço real
import { Dish } from "../../services/dish/dishService";
import "../../styles/components/Menu/SelectDishesModal.css";

interface SelectDishesModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: (dishIds: number[]) => void;
    existingDishes: Dish[] | undefined;
}

const SelectDishesModal: React.FC<SelectDishesModalProps> = ({ show, onClose, onConfirm, existingDishes }) => {
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [selectedDishes, setSelectedDishes] = useState<Dish[]>([]);

    useEffect(() => {
        async function loadDishes() {
            const allDishes = await fetchDish({ page: 0 });
            setDishes(allDishes);
        }
        if (show) {
            loadDishes();
        }
    }, [show]);

    const handleSelectDish = (dish: Dish) => {
        if (selectedDishes.some((d) => d.id === dish.id)) {
            setSelectedDishes(selectedDishes.filter((d) => d.id !== dish.id));
        } else {
            setSelectedDishes([...selectedDishes, dish]);
        }
    };

    const handleConfirm = () => {
        const selectedDishIds = selectedDishes.map((dish) => dish.id); // Extrai apenas os IDs
        onConfirm(selectedDishIds);
        onClose();
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Escolha os Pratos</h2>
                <div className="dishes-list">
                    {dishes.map((dish) => (
                        <div
                            key={dish.id}
                            className={`dish-item ${selectedDishes.some((d) => d.id === dish.id) ? "selected" : ""}`}
                            onClick={() => handleSelectDish(dish)}
                        >
                            <p>{dish.name}</p>
                        </div>
                    ))}
                </div>
                <div className="modal-buttons">
                    <button className="confirm-button" onClick={handleConfirm}>Confirmar</button>
                    <button className="cancel-button" onClick={onClose}>Cancelar</button>
                </div>
            </div>
        </div>
    );
};

export default SelectDishesModal;
