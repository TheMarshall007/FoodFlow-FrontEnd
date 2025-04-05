import React, { useState, useEffect } from 'react';
import styles from '../../styles/components/Ingredient/ManageIngredient.module.css';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { PaginatedResponse } from '../../services/api/apiResponse';
import {
    fetchIngredients,
    deleteIngredient,
    updateIngredient,
    IngredientDTOResponse,
    IngredientDTOInsert,
    IngredientDTOSearch,
    IngredientDTOUpdate,
    IngredientType,
    insertIngredient
} from '../../services/ingredient/ingredientService';
import AddIngredientModal from './AddIngredientModal';
import DeleteConfirmationModal from '../UI/DeleteConfirmationModal';

const ManageIngredients: React.FC = () => {
    const [ingredients, setIngredients] = useState<IngredientDTOResponse[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [ingredientToEdit, setIngredientToEdit] = useState<IngredientDTOResponse | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Estado para controlar o modal de exclusão
    const [ingredientToDelete, setIngredientToDelete] = useState<IngredientDTOResponse | null>(null); // Ingrediente a ser excluído

    useEffect(() => {
        loadIngredients();
    }, [currentPage, searchTerm]);

    const loadIngredients = async () => {
        setLoading(true);
        try {
            const ingredientData: PaginatedResponse<IngredientDTOResponse> = await fetchIngredients({ page: currentPage } as IngredientDTOSearch);
            setIngredients(ingredientData.content);
            setTotalPages(ingredientData.totalPages);
        } catch (error) {
            console.error('Error loading ingredients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearchChange = (name: string) => {
        setSearchTerm(name);
    };

    const matchesSearch = (ingredient: IngredientDTOResponse, searchTerm: string) => {
        const nameMatch = !searchTerm || ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
        return nameMatch;
    };

    const filteredIngredients = ingredients.filter((ingredient) => matchesSearch(ingredient, searchTerm));

    const handleAddIngredient = () => {
        setIsAddModalOpen(true);
    };

    const handleEditIngredient = (ingredient: IngredientDTOResponse) => {
        setIngredientToEdit(ingredient);
        setIsEditModalOpen(true);
    };

    const handleDeleteIngredient = (ingredient: IngredientDTOResponse) => {
        setIngredientToDelete(ingredient); // Define o ingrediente a ser excluído
        setIsDeleteModalOpen(true); // Abre o modal de confirmação
    };

    const handleAddIngredientSubmit = async (name: string, categoryId: number, type: IngredientType) => {
        try {
            await insertIngredient({ name, categoryId, type } as IngredientDTOInsert);
            loadIngredients();
        } catch (error) {
            console.error('Error adding ingredient:', error);
        } finally {
            setIsAddModalOpen(false);
        }
    };

    const handleEditIngredientSubmit = async (ingredient: IngredientDTOUpdate) => {
        try {
            await updateIngredient(ingredient);
            loadIngredients();
        } catch (error) {
            console.error('Error updating ingredient:', error);
        } finally {
            setIsEditModalOpen(false);
        }
    };

    const handleDeleteIngredientConfirm = async () => {
        if (ingredientToDelete) {
            try {
                await deleteIngredient(ingredientToDelete.id);
                loadIngredients();
            } catch (error) {
                console.error('Error deleting ingredient:', error);
            } finally {
                setIsDeleteModalOpen(false); // Fecha o modal
                setIngredientToDelete(null); // Limpa o ingrediente a ser excluído
            }
        }
    };

    const handleDeleteIngredientCancel = () => {
        setIsDeleteModalOpen(false); // Fecha o modal
        setIngredientToDelete(null); // Limpa o ingrediente a ser excluído
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.container}>
                <h2>Gerenciar Ingredientes</h2>
                <button onClick={handleAddIngredient} className={styles.addButton}>
                    <FaPlus /> Adicionar Ingrediente
                </button>
                {loading ? (
                    <p>Carregando ingredientes...</p>
                ) : (
                    <>
                        {filteredIngredients.length === 0 ? (
                            <p>Não há ingredientes cadastrados.</p>
                        ) : (
                            <table className={styles.ingredientTable}>
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Categoria</th>
                                        <th>Tipo</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredIngredients.map((ingredient) => (
                                        <tr key={ingredient.id}>
                                            <td>{ingredient.name}</td>
                                            <td>{ingredient.categoryId}</td>
                                            <td>{ingredient.type}</td>
                                            <td>
                                                <button onClick={() => handleEditIngredient(ingredient)} className={styles.editButton}>
                                                    <FaEdit />
                                                </button>
                                                <button onClick={() => handleDeleteIngredient(ingredient)} className={styles.deleteButton}>
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
                <div className={styles.pagination}>
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handlePageChange(index)}
                            className={index === currentPage ? styles.active : ''}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
                {isAddModalOpen && (
                    <AddIngredientModal
                        onClose={() => setIsAddModalOpen(false)}
                        onAddIngredient={handleAddIngredientSubmit}
                    />
                )}
                {isEditModalOpen && ingredientToEdit && (
                    <AddIngredientModal
                        onClose={() => setIsEditModalOpen(false)}
                        onEditIngredient={handleEditIngredientSubmit}
                        ingredientToEdit={ingredientToEdit}
                    />
                )}
                {/* Renderiza o modal de confirmação */}
                <DeleteConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={handleDeleteIngredientCancel}
                    onConfirm={handleDeleteIngredientConfirm}
                    itemToDelete={ingredientToDelete?.name || ''}
                />
            </div>
        </div>
    );
};

export default ManageIngredients;
