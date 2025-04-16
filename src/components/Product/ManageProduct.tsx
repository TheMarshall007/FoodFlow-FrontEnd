import React, { useState, useEffect } from 'react';
import {
    fetchProducts,
    deleteProduct,
    updateProduct,
    ProductDTOInsert,
    // Removido: validateTemporaryProduct - não usado diretamente aqui
    ProductDTOResponse,
    findOrCreateTemporaryProduct, // Importar serviço para adicionar
    UnitOfMeasure,
    SaleType, // Importar UnitOfMeasure se necessário para onAddProduct
} from '../../services/product/productService';
import styles from '../../styles/components/Product/ManageProducts.module.css';
import { FaEdit, FaTrash, FaSearch, FaPlus } from 'react-icons/fa'; // Adicionar FaPlus
import { PaginatedResponse } from '../../services/api/apiResponse';
import AddTemporaryProductModal from './AddTemporaryProductModal';
import { useUser } from '../../context/UserContext'; // Importar useUser

// Interface ProductDTOSearch permanece a mesma
interface ProductDTOSearch {
    id?: number;
    page: number
}

const ManageProduct: React.FC = () => {
    const { user } = useUser(); // Obter usuário do contexto
    const [products, setProducts] = useState<ProductDTOResponse[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [productNameSearch, setProductNameSearch] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Novo estado para modal de adição
    const [productToEdit, setProductToEdit] = useState<ProductDTOResponse | null>(null);

    useEffect(() => {
        loadProducts();
    }, [currentPage]); // Remover searchTerm e productNameSearch daqui para evitar recargas desnecessárias em cada digitação

    // Função para carregar produtos (pode ser chamada manualmente após busca ou adição/edição/deleção)
    const loadProducts = async (page = currentPage, gtin = searchTerm, name = productNameSearch) => {
        setLoading(true);
        try {
            // Idealmente, a API fetchProducts deveria aceitar gtin e name para filtrar no backend
            // Se não, o filtro será feito apenas no frontend como está agora.
            // Passando page como parte do objeto ProductDTOSearch
            const productData: PaginatedResponse<ProductDTOResponse> = await fetchProducts({ page } as ProductDTOSearch);
            setProducts(productData.content);
            setTotalPages(productData.totalPages);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    // Função para aplicar filtros do frontend
    const getFilteredProducts = () => {
        return products.filter((product) => {
            const gtinMatch = !searchTerm || product.gtin.toLowerCase().includes(searchTerm.toLowerCase());
            const nameMatch = !productNameSearch ||
                product.name?.toLowerCase().includes(productNameSearch.toLowerCase()) ||
                product.brand?.toLowerCase().includes(productNameSearch.toLowerCase());
            return gtinMatch && nameMatch;
        });
    };

    const filteredProducts = getFilteredProducts(); // Chamar a função para obter produtos filtrados

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        loadProducts(page); // Recarregar produtos para a nova página
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        // Opcional: Chamar loadProducts() aqui se a busca for feita no backend
        // Se a busca for só frontend, não precisa recarregar
    };

    const handleProductNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setProductNameSearch(event.target.value);
        // Opcional: Chamar loadProducts() aqui se a busca for feita no backend
    };

    const handleEditProduct = (product: ProductDTOResponse) => {
        setProductToEdit(product);
        setIsEditModalOpen(true);
    };

    const handleDeleteProduct = async (product: ProductDTOResponse) => {
        // Adicionar confirmação antes de deletar
        if (window.confirm(`Tem certeza que deseja excluir o produto ${product.name} (${product.gtin})?`)) {
            try {
                await deleteProduct(product.gtin);
                loadProducts(currentPage); // Recarregar a página atual
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Erro ao excluir produto.'); // Informar usuário
            }
        }
    };

    const handleEditProductSubmit = async (gtin: string, product: ProductDTOInsert) => {
        try {
            await updateProduct(gtin, product);
            setIsEditModalOpen(false); // Fechar modal ao submeter
            loadProducts(currentPage); // Recarregar produtos
        } catch (error) {
            console.error('Error updating product:', error);
            // Idealmente, mostrar erro dentro do modal
        }
    };

    // Nova função para lidar com a adição de produto
    const handleAddProductSubmit = async (gtin: string, name: string, brand: string, quantityPerUnit: number, unit: UnitOfMeasure, saleType:SaleType) => {
        if (!user) {
            console.error("User not loaded. Cannot add temporary product.");
            alert("Erro: Usuário não carregado."); // Informar usuário
            return;
        }
        try {
            // Usando findOrCreateTemporaryProduct como no ProductSelectionModal
            await findOrCreateTemporaryProduct({ gtin, name, brand, quantityPerUnit, unit, userId: user.id, saleType, });
            setIsAddModalOpen(false); // Fechar modal ao submeter
            loadProducts(currentPage); // Recarregar produtos
        } catch (error) {
            console.error("Error adding temporary product:", error);
            // Idealmente, mostrar erro dentro do modal
            alert("Erro ao adicionar produto temporário."); // Informar usuário
        }
    };


    return (
        <div className={styles.pageContainer}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2>Gerenciar Produtos</h2>
                    {/* Botão para abrir o modal de adição */}
                    <button
                        className={styles.addButton}
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <FaPlus /> Adicionar Produto
                    </button>
                </div>
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
                    {/* Opcional: Botão para disparar a busca se não for em tempo real */}
                    {/* <button onClick={() => loadProducts(0)}>Buscar</button> */}
                </div>
                {loading ? (
                    <p>Carregando produtos...</p>
                ) : (
                    <>
                        <table className={styles.productTable}>
                            <thead>
                                <tr>
                                    <th>GTIN</th>
                                    <th>Nome</th>
                                    <th>Marca</th>
                                    <th>Qtd. Unidade</th> {/* Abreviação */}
                                    <th>Unidade</th>
                                    <th>Temporário</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map((product) => (
                                        <tr key={product.gtin} className={product.isTemporary ? styles.temporaryRow : ''}>
                                            <td>{product.gtin}</td>
                                            <td>{product.name}</td>
                                            <td>{product.brand || '-'}</td> {/* Mostrar '-' se não houver marca */}
                                            <td>{product.quantityPerUnit}</td>
                                            <td>{product.unit}</td>
                                            <td>{product.isTemporary ? 'Sim' : 'Não'}</td>
                                            <td className={styles.actionsCell}> {/* Classe para alinhar botões */}
                                                <button
                                                    onClick={() => handleEditProduct(product)}
                                                    className={`${styles.actionButton} ${styles.editButton}`} // Classes comuns e específicas
                                                    title="Editar" // Tooltip
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product)}
                                                    className={`${styles.actionButton} ${styles.deleteButton}`} // Classes comuns e específicas
                                                    title="Excluir" // Tooltip
                                                >
                                                    <FaTrash />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center' }}>Nenhum produto encontrado com os filtros atuais.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {/* Paginação */}
                        {totalPages > 1 && (
                             <div className={styles.pagination}>
                                {Array.from({ length: totalPages }, (_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handlePageChange(index)}
                                        className={index === currentPage ? styles.active : ''}
                                        disabled={loading} // Desabilitar enquanto carrega
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Modal de Edição */}
                {isEditModalOpen && productToEdit && (
                    <AddTemporaryProductModal
                        onClose={() => {
                            setIsEditModalOpen(false);
                            setProductToEdit(null); // Limpar produto a editar ao fechar
                            // loadProducts(); // Não precisa recarregar aqui, só ao submeter
                        }}
                        productToEdit={productToEdit}
                        onEditProduct={handleEditProductSubmit}
                        prefilledName={productToEdit.name} // prefilledGtin já vem de productToEdit
                    />
                )}

                {/* Modal de Adição */}
                {isAddModalOpen && (
                    <AddTemporaryProductModal
                        onClose={() => setIsAddModalOpen(false)}
                        onAddProduct={handleAddProductSubmit} // Passar a nova função
                        prefilledName={productNameSearch} // Pré-preencher com a busca (opcional)
                        prefilledGtin={searchTerm}       // Pré-preencher com a busca (opcional)
                    />
                )}
            </div>
        </div>
    );
};

export default ManageProduct;
