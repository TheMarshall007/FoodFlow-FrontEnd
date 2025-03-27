import React, { useEffect, useState } from 'react';
import styles from '../../styles/components/Product/AddTemporaryProductModal.module.css';
import { UnitOfMeasure, Product, ProductDTOInsert, validateTemporaryProduct } from '../../services/product/productService';
import { useUser } from '../../context/UserContext';

interface AddTemporaryProductModalProps {
    onClose: () => void;
    onAddProduct?: (gtin: string, name: string, brand: string, quantityPerUnit: number, unit: UnitOfMeasure) => void;
    onEditProduct?: (gtin: string, product: ProductDTOInsert) => Promise<void>;
    prefilledGtin?: string; // Optional prefilled GTIN
    prefilledName: string;
    productToEdit?: Product;
}

const AddTemporaryProductModal: React.FC<AddTemporaryProductModalProps> = ({ onClose, onAddProduct, onEditProduct, prefilledGtin, prefilledName, productToEdit }) => {
    const [gtin, setGtin] = useState('');
    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [error, setError] = useState('');
    const [quantityPerUnit, setQuantityPerUnit] = useState<number | undefined>(undefined); // Now can be undefined
    const [unit, setUnit] = useState<UnitOfMeasure | undefined>(undefined); // Now can be undefined
    const { user } = useUser();

    useEffect(() => {
        setGtin(prefilledGtin || ''); // Set initial GTIN value
        setName(prefilledName || ''); // Set initial name value
        if (productToEdit) {
            setGtin(productToEdit.gtin);
            setName(productToEdit.name);
            setBrand(productToEdit.brand || '');
            setQuantityPerUnit(productToEdit.quantityPerUnit);
            setUnit(productToEdit.unit);
        }
    }, [prefilledGtin, prefilledName, productToEdit]);


    const handleSubmit = async () => {
        if (!gtin || !name) {
            setError("GTIN e Nome do Produto são obrigatórios");
            return;
        }

        if (onEditProduct && productToEdit) {
            try {
                await onEditProduct(productToEdit.gtin, {
                    gtin: gtin,
                    name: name,
                    brand: brand,
                    quantityPerUnit: quantityPerUnit || 0,
                    unit: unit || UnitOfMeasure.UNIT,
                    ingredientsIds: productToEdit.ingredientsIds,
                    nutritionalInfo: {
                        servingSize: "",
                        nutritionalDetails: {},
                    },
                    categoriesIds: [],
                });
                onClose();
            } catch (error) {
                console.error("Error updating product:", error);
                setError("Error updating product");
            }
        } else if (onAddProduct) {
            onAddProduct(gtin, name, brand, quantityPerUnit || 0, unit || UnitOfMeasure.UNIT);
            onClose();
        }
        setError("");
    };

    const handleValidateProduct = async () => {
        if (productToEdit) {
            try {
                await validateTemporaryProduct(productToEdit.gtin);
                onClose();
            } catch (error) {
                console.error("Error validating temporary product:", error);
                setError("Error validating temporary product");
            }
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.addProductModalContent}>
                <h3>{productToEdit ? 'Editar Produto' : 'Adicionar Novo Produto'}</h3>
                <label className={styles['required-field']} htmlFor="gtin">GTIN (Código de Barras)</label>
                <input
                    id="gtin"
                    className={styles['required-field-input']}
                    type="text"
                    placeholder="Ex: 000000999999999999"
                    value={gtin}
                    onChange={(e) => setGtin(e.target.value)}
                    disabled={!!productToEdit}
                />
                <label className={styles['required-field']} htmlFor="name">Nome do Produto</label>
                <input
                    id="name"
                    className={styles['required-field-input']}
                    type="text"
                    placeholder="Ex: Leite Integral"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <label className={styles['optional-field']} htmlFor="brand">Marca do Produto</label>
                <input
                    id="brand"
                    type="text"
                    placeholder="Ex: Piracanjuba"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                />
                <label className={styles['optional-field']} htmlFor="quantityPerUnit">Quantidade por Unidade</label>
                <input
                    id="quantityPerUnit"
                    type="number"
                    placeholder="Ex: 1"
                    value={quantityPerUnit === undefined ? '' : quantityPerUnit}
                    onChange={(e) => setQuantityPerUnit(e.target.value === '' ? undefined : Number(e.target.value))}
                />
                <label className={styles['optional-field']} htmlFor="unit">Unidade</label>
                <select id="unit" value={unit === undefined ? '' : unit} onChange={(e) => setUnit(e.target.value === '' ? undefined : e.target.value as UnitOfMeasure)}>
                    <option value="">Selecione a Unidade</option>
                    <option value={UnitOfMeasure.KILOGRAM}>KG</option>
                    <option value={UnitOfMeasure.LITER}>L</option>
                    <option value={UnitOfMeasure.GRAM}>g</option>
                    <option value={UnitOfMeasure.MILLILITER}>ml</option>
                    <option value={UnitOfMeasure.UNIT}>Unidade</option>
                </select>
                {error && <div className={styles.error}>{error}</div>}
                <div className={styles.modalButtons}>
                    <button onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                    {user?.roles.includes("ROLE_ADMIN") && productToEdit && (
                        <button onClick={handleValidateProduct} className={styles.validateButton}>Validar Produto</button>
                    )}
                    <button onClick={handleSubmit} className={styles.confirmButton}>{productToEdit ? 'Salvar Alterações' : 'Adicionar Produto'}</button>
                </div>
            </div>
        </div>
    );
};

export default AddTemporaryProductModal;
