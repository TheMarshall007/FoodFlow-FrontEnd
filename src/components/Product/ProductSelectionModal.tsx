import React, { useState, useEffect } from "react";
import "../../styles/components/Product/ProductSelectionModal.css";
import {
    Product,
    ProductDTOResponseSimple,
    UnitOfMeasure,
    fetchProducts,
    findOrCreateTemporaryProduct,
} from "../../services/product/productService";
import ProductCard from "../Product/ProductCard";
import ProductSearchInput from "./ProductSearchInput";
import AddTemporaryProductModal from "./AddTemporaryProductModal";
import { FaPlus } from "react-icons/fa";
import { useUser } from "../../context/UserContext";

interface ProductSelectionModalProps {
    onClose: () => void;
    onConfirm: (selectedProducts: (Product | ProductDTOResponseSimple)[]) => void;
}

const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({ onClose, onConfirm }) => {
    const { user } = useUser();
    const [selectedProducts, setSelectedProducts] = useState<(Product | ProductDTOResponseSimple)[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [productNameSearch, setProductNameSearch] = useState("");
    const [isNewProduct, setIsNewProduct] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [modalGtin, setModalGtin] = useState("");
    const [modalName, setModalName] = useState("");

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const productData = await fetchProducts({ page: 0 });
                setProducts(productData.content);
            } catch (error) {
                console.error("Error to load products", error);
            }
        };
        loadProducts();
    }, []);

    const toggleProductSelection = (product: Product | ProductDTOResponseSimple, isNew: boolean) => {
        setIsNewProduct(isNew);
        setSelectedProducts((prevSelected) =>
            prevSelected.some((p) => p.gtin === product.gtin)
                ? prevSelected.filter((p) => p.gtin !== product.gtin)
                : [...prevSelected, product]
        );
    };

    const matchesSearch = (product: Product, searchTerm: string, productNameSearch: string) => {
        const gtinMatch = !searchTerm || product.gtin.startsWith(searchTerm);

        const nameMatch = !productNameSearch || (
            product.name?.toLowerCase().includes(productNameSearch.toLowerCase()) ||
            product.brand?.toLowerCase().includes(productNameSearch.toLowerCase())
        );

        return gtinMatch && nameMatch;
    };

    const filteredProducts = products.filter((product) => matchesSearch(product, searchTerm, productNameSearch));

    const handleAddProduct = async (gtin: string, name: string, brand: string, quantityPerUnit: number, unit: UnitOfMeasure) => {
        if (!user) {
            console.error("User not loaded. Cannot add temporary product.");
            return;
        }
        try {
            const newProduct = await findOrCreateTemporaryProduct({ gtin, name, brand, quantityPerUnit, unit, userId: user.id });
            toggleProductSelection({ ...newProduct, brand }, true);
        } catch (error) {
            console.error("Error adding temporary product:", error);
        }
    };

    const handleSearchTermChange = (searchTerm: string, productName: string) => {
        setSearchTerm(searchTerm);
        setModalGtin(searchTerm);
        setModalName(productName);
        setProductNameSearch(productName); 
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content-product-selection">
                <h3>Select Products</h3>
                <ProductSearchInput onSearchTermChange={handleSearchTermChange} />

                <div className="product-list">
                    {filteredProducts.length === 0 ? (
                        <p>No products found.</p>
                    ) : (
                        filteredProducts.map((product) => (
                            <ProductCard
                                key={product.gtin}
                                product={product}
                                isSelected={selectedProducts.some((p) => p.gtin === product.gtin)}
                                isNew={isNewProduct}
                                actions={
                                    <button onClick={() => toggleProductSelection(product, false)}>
                                        {selectedProducts.some((p) => p.gtin === product.gtin)
                                            ? "Remove"
                                            : "Select"}
                                    </button>
                                }
                            />
                        ))
                    )}
                    {/* Button to open the modal to add a new product */}
                    <div className="add-product-button-card" onClick={() => setIsAddModalOpen(true)}>
                        <FaPlus size={32} />
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose} className="cancel-button">
                        Cancel
                    </button>
                    <button onClick={() => onConfirm(selectedProducts)} className="confirm-button">
                        Add {selectedProducts.length} Items
                    </button>
                </div>
            </div>
            {isAddModalOpen && (
                <AddTemporaryProductModal
                    onClose={() => setIsAddModalOpen(false)}
                    onAddProduct={handleAddProduct}
                    prefilledGtin={modalGtin}
                    prefilledName={modalName}
                />
            )}
        </div>
    );
};

export default ProductSelectionModal;
