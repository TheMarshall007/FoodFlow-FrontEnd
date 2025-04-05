import React from 'react';
import styles from '../../styles/components/Product/AddTemporaryProductModal.module.css';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemToDelete: string;
    message?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, itemToDelete, message }) => {
    if (!isOpen) {
        return null;
    }

    const defaultMessage = `Tem certeza que deseja excluir "${itemToDelete}"?`;
    const confirmationMessage = message || defaultMessage;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.addProductModalContent}>
                <h3>Confirmar Exclusão</h3>
                <p>{confirmationMessage}</p>
                <div className={styles.modalButtons}>
                    <button onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                    <button onClick={onConfirm} className={styles.confirmButton}>Confirmar</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
