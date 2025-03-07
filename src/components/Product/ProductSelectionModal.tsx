import React, { useState } from "react";
import "../../styles/components/Product/ProductSelectionModal.css";
import { Product } from "../../services/product/productService";
import ProductCard from "../Product/ProductCard";
import { useProduct } from "../../hooks/useProduct";

interface ProductSelectionModalProps {
    onClose: () => void;
    onConfirm: (selectedProducts: Product[]) => void;
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({ onClose, onConfirm }) => {
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState(""); // Estado para armazenar a busca
    const { state } = useProduct();

    // Alterna a seleção do produto
    const toggleProductSelection = (product: Product) => {
        setSelectedProducts((prevSelected) =>
            prevSelected.some((p) => p.gtin === product.gtin)
                ? prevSelected.filter((p) => p.gtin !== product.gtin) // Remove se já estiver selecionado
                : [...prevSelected, product] // Adiciona se não estiver
        );
    };

// Filtra os produtos com base no termo de pesquisa
    // Função para verificar se todas as palavras do termo aparecem em qualquer ordem
    const matchesSearch = (product: Product, searchTerm: string) => {
        if (!searchTerm) return true; // Se não há busca, retorna todos os produtos

        const terms = searchTerm.toLowerCase().split(" "); // Divide a busca em palavras
        const productText = [
            product.variety.ingredient?.name,
            product.variety.name,
            product.brand
        ].join(" ").toLowerCase(); // Junta os campos para buscar

        return terms.every((term) => productText.includes(term)); // Verifica se todas as palavras aparecem
    };

    // Filtra os produtos com base no termo de pesquisa
    const filteredProducts = state.systemProduct.filter((product) => matchesSearch(product, searchTerm));

    return (
        <div className="modal-overlay">
            <div className="modal-content-product-selection">
                <h3>Selecione os Produtos</h3>

                {/* Campo de pesquisa */}
                <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />

                <div className="product-list">
                    {filteredProducts.length === 0 ? (
                        <p>Nenhum produto encontrado.</p>
                    ) : (
                        filteredProducts.map((product) => (
                            <ProductCard
                                key={product.gtin}
                                product={product}
                                isSelected={selectedProducts.some((p) => p.gtin === product.gtin)}
                                actions={
                                    <button onClick={() => toggleProductSelection(product)}>
                                        {selectedProducts.some((p) => p.gtin === product.gtin) ? "Remover" : "Selecionar"}
                                    </button>
                                }
                            />
                        ))
                    )}
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="cancel-button">Cancelar</button>
                    <button onClick={() => onConfirm(selectedProducts)} className="confirm-button">
                        Adicionar {selectedProducts.length} Itens
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductSelectionModal;
