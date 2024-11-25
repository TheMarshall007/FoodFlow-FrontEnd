// PantryForm.tsx
import React, { useState } from 'react';
import './PantryForm.css';
import { useUser } from '../../context/UserContext';
import { createPantry } from '../../services/pantryService';
import { useNavigate } from 'react-router-dom';

const PantryForm = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [propertyName, setPropertyName] = useState('');
    const [selectedImage, setSelectedImage] = useState('');
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const availableImages = [
        require('../../assets/fotos/summer-beach-house.png'),
        require('../../assets/fotos/summer-beach-house-2.png'),
        require('../../assets/fotos/house-field.webp'),
        require('../../assets/fotos/house-field-2.webp'),
        require('../../assets/fotos/house-field-3.webp'),
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            setError('Usuário não autenticado.');
            return;
        }

        try {
            await createPantry({
                userId: user.id,
                propertyName,
                image: selectedImage,
            });
            navigate('/pantries');
        } catch (error) {
            setError('Erro ao cadastrar a despensa. Por favor, tente novamente.');
        }
    };

    return (
        <div className={`pantry-form-container open`}>
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
            </form>
        </div>
    );
};

export default PantryForm;
