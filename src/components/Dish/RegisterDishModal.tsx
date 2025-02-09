import { useState } from "react";
import "../../styles/components/Dishes/RegisterDishModal.css";
import { createDish } from "../../services/dish/dishService";

interface ModalProps {
    onClose: () => void;
}

const RegisterDishModal: React.FC<ModalProps> = ({ onClose }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        if (image) formData.append("image", image);

        try {
            await createDish(formData);
            alert("Prato cadastrado com sucesso!");
            onClose(); // Fecha o modal após cadastro
        } catch (error) {
            alert("Erro ao cadastrar prato.");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>X</button>
                <h2>Adicionar Novo Prato</h2>
                <form onSubmit={handleSubmit}>
                    <label>Nome do Prato:</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

                    <label>Descrição:</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />

                    <label>Imagem:</label>
                    <input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} />

                    <button type="submit">Cadastrar</button>
                </form>
            </div>
        </div>
    );
};

export default RegisterDishModal;
