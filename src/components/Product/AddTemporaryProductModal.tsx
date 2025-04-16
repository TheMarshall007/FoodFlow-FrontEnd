import React, { useEffect, useState } from 'react';
import styles from '../../styles/components/Product/AddTemporaryProductModal.module.css';
import {
    UnitOfMeasure,
    Product,
    ProductDTOInsert,
    validateTemporaryProduct,
    SaleType,
    NutritionalInfo
} from '../../services/product/productService';
import { useUser } from '../../context/UserContext';

interface AddTemporaryProductModalProps {
    onClose: () => void;
    onAddProduct?: (
        gtin: string,
        name: string,
        brand: string,
        quantityPerUnit: number,
        unit: UnitOfMeasure,
        saleType: SaleType
    ) => void;
    onEditProduct?: (gtin: string, product: ProductDTOInsert) => Promise<void>;
    prefilledGtin?: string;
    prefilledName: string;
    productToEdit?: Product; // Certifique-se que Product tem nutritionalInfo com a estrutura correta
}

// Defina uma estrutura padrão para NutritionalInfo se não vier do productToEdit
const defaultNutritionalInfo: NutritionalInfo = {
    id:0,
    servingSize: "",
    nutritionalDetails: {}
};

const AddTemporaryProductModal: React.FC<AddTemporaryProductModalProps> = ({
    onClose,
    onAddProduct,
    onEditProduct,
    prefilledGtin,
    prefilledName,
    productToEdit
}) => {
    const [gtin, setGtin] = useState('');
    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [error, setError] = useState('');
    const [quantityPerUnit, setQuantityPerUnit] = useState<number | undefined>(undefined);
    const [unit, setUnit] = useState<UnitOfMeasure | undefined>(undefined);
    const [saleType, setSaleType] = useState<SaleType | undefined>(undefined);
    const { user } = useUser();

    useEffect(() => {
        setGtin(prefilledGtin || '');
        setName(prefilledName || '');
        if (productToEdit) {
            setGtin(productToEdit.gtin);
            setName(productToEdit.name);
            setBrand(productToEdit.brand || '');
            setQuantityPerUnit(productToEdit.quantityPerUnit);
            setUnit(productToEdit.unit);
            setSaleType(productToEdit.saleType || undefined);
            // Não precisamos definir nutritionalInfo/categoriesIds no estado local
            // a menos que você queira editá-los neste modal específico.
            // Eles serão lidos diretamente de productToEdit no handleSubmit.
        } else {
            setSaleType(SaleType.FIXED_PACKAGE);
        }
    }, [prefilledGtin, prefilledName, productToEdit]);


    const handleSubmit = async () => {
        if (!gtin || !name || !saleType) {
            setError("GTIN, Nome do Produto e Tipo de Venda são obrigatórios");
            return;
        }

        if (onEditProduct && productToEdit) {
            // Certifique-se que os tipos de nutritionalInfo e categoriesIds
            // são compatíveis entre Product e ProductDTOInsert.
            // A forma mais segura é garantir que ambas as interfaces usem
            // a mesma definição para essas propriedades.

            // Use o nullish coalescing operator (??) para fornecer o valor padrão
            // apenas se productToEdit.nutritionalInfo for null ou undefined.
            const nutritionalInfoToSend: NutritionalInfo = productToEdit.nutritionalInfo ?? defaultNutritionalInfo;

            // Faça o mesmo para categoriesIds se necessário (assumindo que seja number[])
            const categoriesIdsToSend: number[] = productToEdit.categoriesIds ?? [];
            const ingredientsIdsToSend: number[] = productToEdit.ingredientsIds ?? [];


            try {
                await onEditProduct(productToEdit.gtin, {
                    gtin: gtin,
                    name: name,
                    brand: brand,
                    quantityPerUnit: quantityPerUnit ?? 0,
                    unit: unit ?? UnitOfMeasure.UNIT,
                    saleType: saleType,
                    ingredientsIds: ingredientsIdsToSend,
                    nutritionalInfo: nutritionalInfoToSend,
                    categoriesIds: categoriesIdsToSend,
                });
                onClose();
            } catch (error) {
                console.error("Error updating product:", error);
                setError("Error updating product");
            }
        } else if (onAddProduct) {
            onAddProduct(
                gtin,
                name,
                brand,
                quantityPerUnit ?? 0, // Usar ?? para clareza
                unit ?? UnitOfMeasure.UNIT, // Usar ?? para clareza
                saleType
            );
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

    // O restante do JSX permanece o mesmo...

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.addProductModalContent}>
                <h3>{productToEdit ? 'Editar Produto' : 'Adicionar Novo Produto'}</h3>

                {/* GTIN */}
                <label className={styles['required-field']} htmlFor="gtin">GTIN (Código de Barras)</label>
                <input
                    id="gtin"
                    className={styles['required-field-input']}
                    type="text"
                    placeholder="Ex: 000000999999999999"
                    value={gtin}
                    onChange={(e) => setGtin(e.target.value)}
                    disabled={!!productToEdit} // Desabilitar GTIN na edição
                />

                {/* Nome */}
                <label className={styles['required-field']} htmlFor="name">Nome do Produto</label>
                <input
                    id="name"
                    className={styles['required-field-input']}
                    type="text"
                    placeholder="Ex: Leite Integral"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                {/* Marca */}
                <label className={styles['optional-field']} htmlFor="brand">Marca do Produto</label>
                <input
                    id="brand"
                    type="text"
                    placeholder="Ex: Piracanjuba"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                />

                {/* Quantidade por Unidade */}
                <label className={styles['optional-field']} htmlFor="quantityPerUnit">Quantidade por Unidade</label>
                <input
                    id="quantityPerUnit"
                    type="number"
                    placeholder="Ex: 1"
                    value={quantityPerUnit === undefined ? '' : quantityPerUnit}
                    onChange={(e) => setQuantityPerUnit(e.target.value === '' ? undefined : Number(e.target.value))}
                />

                {/* Unidade */}
                <label className={styles['optional-field']} htmlFor="unit">Unidade</label>
                <select
                    id="unit"
                    value={unit === undefined ? '' : unit}
                    onChange={(e) => setUnit(e.target.value === '' ? undefined : e.target.value as UnitOfMeasure)}
                >
                    <option value="">Selecione a Unidade</option>
                    <option value={UnitOfMeasure.KILOGRAM}>KG</option>
                    <option value={UnitOfMeasure.LITER}>L</option>
                    <option value={UnitOfMeasure.GRAM}>g</option>
                    <option value={UnitOfMeasure.MILLILITER}>ml</option>
                    <option value={UnitOfMeasure.UNIT}>Unidade</option>
                </select>

                {/* --- NOVO CAMPO: Tipo de Venda --- */}
                <label className={styles['required-field']} htmlFor="saleType">Tipo de Venda</label>
                <select
                    id="saleType"
                    className={styles['required-field-input']} // Usar classe de campo obrigatório se for o caso
                    value={saleType === undefined ? '' : saleType}
                    onChange={(e) => setSaleType(e.target.value === '' ? undefined : e.target.value as SaleType)}
                >
                    <option value="">Selecione o Tipo de Venda</option>
                    <option value={SaleType.BULK}>A Granel (Bulk)</option>
                    <option value={SaleType.FIXED_PACKAGE}>Pacote Fixo (Fixed Package)</option>
                    <option value={SaleType.VARIABLE_PACKAGE}>Pacote Variável (Variable Package)</option>
                </select>
                {/* --- FIM DO NOVO CAMPO --- */}


                {error && <div className={styles.error}>{error}</div>}
                <div className={styles.modalButtons}>
                    <button onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                    {user?.roles.includes("ROLE_ADMIN") && productToEdit?.isTemporary && ( // Mostrar botão apenas para temporários
                        <button onClick={handleValidateProduct} className={styles.validateButton}>Validar Produto</button>
                    )}
                    <button onClick={handleSubmit} className={styles.confirmButton}>{productToEdit ? 'Salvar Alterações' : 'Adicionar Produto'}</button>
                </div>
            </div>
        </div>
    );
};

export default AddTemporaryProductModal;

