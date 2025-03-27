import React, { useState, useEffect } from 'react';
import {
    fetchProducts,
    deleteProduct,
    updateProduct,
    ProductDTOInsert,
    validateTemporaryProduct,
    ProductDTOResponse,
} from '../../services/product/productService';
import styles from '../../styles/components/Product/ManageProducts.module.css';
import { FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { PaginatedResponse } from '../../services/api/apiResponse';
import AddTemporaryProductModal from './AddTemporaryProductModal';

// Add this interface here
interface ProductDTOSearch {
    id?: number;
    page: number
}

const ManageProducts: React.FC = () => {
    const [products, setProducts] = useState<ProductDTOResponse[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [productNameSearch, setProductNameSearch] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<ProductDTOResponse | null>(null);

    useEffect(() => {
        loadProducts();
    }, [currentPage, searchTerm, productNameSearch]);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const productData: PaginatedResponse<ProductDTOResponse> = await fetchProducts({ page: currentPage } as ProductDTOSearch);
            setProducts(productData.content);
            setTotalPages(productData.totalPages);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleProductNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProductNameSearch(event.target.value);
    };

    const matchesSearch = (product: ProductDTOResponse, searchTerm: string, productNameSearch: string) => {
        const gtinMatch = !searchTerm || product.gtin.startsWith(searchTerm);

        const nameMatch = !productNameSearch || (
            product.name?.toLowerCase().includes(productNameSearch.toLowerCase()) ||
            product.brand?.toLowerCase().includes(productNameSearch.toLowerCase())
        );

        return gtinMatch && nameMatch;
    };

    const filteredProducts = products.filter((product) => matchesSearch(product, searchTerm, productNameSearch));

    const handleEditProduct = (product: ProductDTOResponse) => {
        setProductToEdit(product);
        setIsEditModalOpen(true);
    };

    const handleDeleteProduct = async (product: ProductDTOResponse) => {
        try {
            await deleteProduct(product.gtin);
            loadProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleEditProductSubmit = async (gtin: string, product: ProductDTOInsert) => {
        try {
            await updateProduct(gtin, product);
            loadProducts();
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.container}>
                <h2>Gerenciar Produtos</h2>
                <div className={styles.searchContainer}>
                    <div className={styles.searchBar}>
                        <FaSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Pesquisar por GTIN"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <div className={styles.searchBar}>
                        <FaSearch className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Pesquisar por Nome ou Marca"
                            value={productNameSearch}
                            onChange={handleProductNameChange}
                        />
                    </div>
                </div>
                {loading ? (
                    <p>Carregando produtos...</p>
                ) : (
                    <table className={styles.productTable}>
                        <thead>
                            <tr>
                                <th>GTIN</th>
                                <th>Nome</th>
                                <th>Marca</th>
                                <th>Quantidade por Unidade</th>
                                <th>Unidade</th>
                                <th>Temporário</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product.gtin}>
                                    <td>{product.gtin}</td>
                                    <td>{product.name}</td>
                                    <td>{product.brand}</td>
                                    <td>{product.quantityPerUnit}</td>
                                    <td>{product.unit}</td>
                                    <td>{product.isTemporary ? 'Sim' : 'Não'}</td>
                                    <td>
                                        <button onClick={() => handleEditProduct(product)} className={styles.editButton}>
                                            <FaEdit />
                                        </button>
                                        <button onClick={() => handleDeleteProduct(product)} className={styles.deleteButton}>
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                {isEditModalOpen && productToEdit && (
                    <AddTemporaryProductModal
                        onClose={() => {
                            setIsEditModalOpen(false);
                            loadProducts();
                        }}
                        productToEdit={productToEdit}
                        onEditProduct={handleEditProductSubmit}
                        prefilledName={productToEdit.name}
                    />
                )}
            </div>
        </div>
    );
};

export default ManageProducts;
