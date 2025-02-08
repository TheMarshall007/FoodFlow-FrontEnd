import React, { useState, useEffect } from "react";
import { fetchPantry } from "../../services/pantry/pantryService";
import { useUser } from "../../context/UserContext";

interface Pantry {
    id: number;
    propertyName: string;
}

interface SelectPantryModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: (pantryId: number) => void;
}

const SelectPantryModal: React.FC<SelectPantryModalProps> = ({ show, onClose, onConfirm }) => {
    const { user } = useUser();

    const [pantries, setPantries] = useState<Pantry[]>([]);
    const [selectedPantryId, setSelectedPantryId] = useState<number | null>(null);

    useEffect(() => {
        if (show && user) {
            fetchPantry({ userId: user.id, page: 0 })
                .then((data) => {
                    setPantries(data)
                })
                .catch((error) => console.error("Erro ao buscar as dispensas:", error));
        }
    }, [show]);

    const handleConfirm = () => {
        if (selectedPantryId !== null) {
            onConfirm(selectedPantryId);
            onClose();
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Selecionar uma Despensa</h2>
                <ul className="pantry-list">
                    {pantries.map((pantry) => (
                        <li
                            key={pantry.id}
                            className={selectedPantryId === pantry.id ? "selected" : ""}
                            onClick={() => setSelectedPantryId(pantry.id)}
                        >
                            {pantry.propertyName}
                        </li>
                    ))}
                </ul>
                <div className="modal-actions">
                    <button onClick={onClose}>Cancelar</button>
                    <button onClick={handleConfirm} disabled={selectedPantryId === null}>
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SelectPantryModal;
