import React, { useState, ChangeEvent, useEffect } from 'react';
import styles from '../../styles/components/Product/ProductSearchInput.module.css';

interface ProductSearchInputProps {
    onSearchTermChange: (searchTerm: string, productName: string) => void; // Callback for search term changes
}

const ProductSearchInput: React.FC<ProductSearchInputProps> = ({ onSearchTermChange }) => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [productName, setProductName] = useState<string>("");

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchTerm(value);
    };

    const handleProductNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setProductName(value);
    };
    useEffect(() => {
        onSearchTermChange(searchTerm, productName); // Call the callback on every input change
    }, [searchTerm, productName, onSearchTermChange]);

    return (
        <div className={styles.productSearchInput}>
            <input
                type="text"
                placeholder="Enter GTIN"
                value={searchTerm}
                onChange={handleInputChange}
            />
            <input
                type="text"
                placeholder="Enter name"
                value={productName}
                onChange={handleProductNameChange}
            />
        </div>
    );
};

export default ProductSearchInput;
