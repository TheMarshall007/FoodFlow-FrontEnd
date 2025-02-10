// PantryForm.tsx
import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { createPantry } from '../../services/pantry/pantryService';
import { useNavigate } from 'react-router-dom';
import '../../styles/pages/Pantry/PantryForm.css';
import { usePantry } from '../../hooks/pentry/usePentry';


interface PantryModalProps {
    isOpen: boolean;
    onClose: () => void;
}


const PantryForm: React.FC<PantryModalProps> = ({ isOpen, onClose }) => {
    const { user } = useUser();
    const { handleCreatePantry } = usePantry();
    const [propertyName, setPropertyName] = useState('');
    const [selectedImage, setSelectedImage] = useState('');
    const [error, setError] = useState('');

    const availableImages = [
        require('../../assets/fotos/summer-beach-house.png'),
        require('../../assets/fotos/summer-beach-house-2.png'),
        require('../../assets/fotos/house-field.webp'),
        require('../../assets/fotos/house-field-2.webp'),
        require('../../assets/fotos/house-field-3.webp'),
    ];

    if (!isOpen) return null;


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (user) {
            await handleCreatePantry({ userId: user.id, propertyName, image: selectedImage });
            onClose(); // Fecha o modal após a criação
        }
    };

    return (
        <div className={`pantry-form-container `}>
            <h2>Cadastrar Nova Despensa</h2>
            <form onSubmit={handleSubmit} className="pantry-form">
                <div className="form-group">
                    <label htmlFor="propertyName">Nome da Despensa:</label>
                    <input
                        type="text"
                        id="propertyName"
                        value={propertyName}
                        onChange={(e) => setPropertyName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Escolha uma imagem para a despensa:</label>
                    <div className="image-selection">
                        {availableImages.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Imagem ${index + 1}`}
                                className={`pantry-form-image ${selectedImage === image ? 'selected' : ''}`}
                                onClick={() => setSelectedImage(image)}
                            />
                        ))}
                    </div>
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="submit-button">Cadastrar</button>
                <button type="button" onClick={onClose} className="cancel-button">Cancelar</button>

            </form>
        </div>
    );
};

export default PantryForm;
