import React, { useState } from "react";
import { useMenu } from "../../hooks/Menu/useMenu";
import "../../styles/pages/Menu/MenuForm.css";

interface MenuModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const MenuForm: React.FC<MenuModalProps> = ({ isOpen, onClose }) => {
    const { handleCreateMenu } = useMenu();
    const [menuName, setMenuName] = useState("");
    const [menuDescription, setMenuDescription] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleCreateMenu({ 
            name: menuName, 
            description: menuDescription, 
            userId: 1 // Ajuste para pegar o usuário correto
        });
        onClose(); // Fecha o modal após a criação
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Adicionar Novo Menu</h2>
                <form onSubmit={handleSubmit}>
                    <label>Nome do Menu</label>
                    <input
                        type="text"
                        value={menuName}
                        onChange={(e) => setMenuName(e.target.value)}
                        required
                    />

                    <label>Descrição</label>
                    <textarea
                        value={menuDescription}
                        onChange={(e) => setMenuDescription(e.target.value)}
                        required
                    ></textarea>

                    <button type="submit">Criar Menu</button>
                    <button type="button" onClick={onClose} className="cancel-button">Cancelar</button>
                </form>
            </div>
        </div>
    );
};

export default MenuForm;
