import React, { useEffect, useState } from 'react';
import styles from '../../styles/components/Product/AddTemporaryProductModal.module.css';
import { IngredientDTOResponse, IngredientDTOUpdate, IngredientType } from '../../services/ingredient/ingredientService';

interface AddIngredientModalProps {
    onClose: () => void;
    onAddIngredient?: (name: string, categoryId: number, type: IngredientType) => void;
    onEditIngredient?: (ingredient: IngredientDTOUpdate) => Promise<void>;
    ingredientToEdit?: IngredientDTOResponse;
}

const AddIngredientModal: React.FC<AddIngredientModalProps> = ({ onClose, onAddIngredient, onEditIngredient, ingredientToEdit }) => {
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState<number | null>(null);
    const [type, setType] = useState<IngredientType>('USABLE');
    const [error, setError] = useState('');

    useEffect(() => {
        if (ingredientToEdit) {
            setName(ingredientToEdit.name);
            setCategoryId(ingredientToEdit.categoryId || null);
            setType(ingredientToEdit.type);
        }
    }, [ingredientToEdit]);

    const handleSubmit = async () => {
        if (!name) {
            setError("Nome do Ingrediente é obrigatório");
            return;
        }
        if (!type) {
            setError("Tipo do Ingrediente é obrigatório");
            return;
        }

        if (onEditIngredient && ingredientToEdit) {
            try {
                await onEditIngredient({
                    id: ingredientToEdit.id,
                    name: name,
                    categoryId: categoryId,
                    type: type,
                });
                onClose();
            } catch (error) {
                console.error("Error updating ingredient:", error);
                setError("Error updating ingredient");
            }
        } else if (onAddIngredient) {
            onAddIngredient(name, categoryId || 0, type);
            onClose();
        }
        setError("");
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.addProductModalContent}>
                <h3>{ingredientToEdit ? 'Editar Ingrediente' : 'Adicionar Novo Ingrediente'}</h3>
                <label className={styles['required-field']} htmlFor="name">Nome do Ingrediente</label>
                <input
                    id="name"
                    className={styles['required-field-input']}
                    type="text"
                    placeholder="Ex: Farinha de Trigo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <label className={styles['optional-field']} htmlFor="categoryId">Categoria do Ingrediente</label>
                <input
                    id="categoryId"
                    type="number"
                    placeholder="Ex: 1"
                    value={categoryId === null ? '' : categoryId}
                    onChange={(e) => setCategoryId(e.target.value === '' ? null : Number(e.target.value))}
                />
                <label className={styles['required-field']} htmlFor="type">Tipo do Ingrediente</label>
                <select id="type" value={type} onChange={(e) => setType(e.target.value as IngredientType)}>
                    <option value="USABLE">USABLE</option>
                    <option value="INDUSTRIAL">INDUSTRIAL</option>
                </select>
                {error && <div className={styles.error}>{error}</div>}
                <div className={styles.modalButtons}>
                    <button onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                    <button onClick={handleSubmit} className={styles.confirmButton}>{ingredientToEdit ? 'Salvar Alterações' : 'Adicionar Ingrediente'}</button>
                </div>
            </div>
        </div>
    );
};

export default AddIngredientModal;
