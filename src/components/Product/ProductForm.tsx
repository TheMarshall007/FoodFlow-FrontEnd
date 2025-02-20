import { useState } from "react";
import "../../styles/components/Product/ProductForm.css"
// import { createProduct } from "../../services/product/productService";

const ProductForm: React.FC<{}> = ({ }) => {
    const [brand, setBrand] = useState("");
    const [quantity, setQuantity] = useState("");
    const [unit, setUnit] = useState("KG");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // await createProduct({ brand, quantityPerUnit: parseFloat(quantity), unit });
            // onClose();
        } catch (error) {
            console.error("Erro ao adicionar produto:", error);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Adicionar Produto</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Marca" value={brand} onChange={(e) => setBrand(e.target.value)} required />
                    <input type="number" placeholder="Quantidade" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                    <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                        <option value="KG">KG</option>
                        <option value="LITER">L</option>
                        <option value="UNIT">Unidade</option>
                    </select>
                    <button type="submit">Adicionar</button>
                    {/* <button onClick={onClose}>Fechar</button> */}
                </form>
            </div>
        </div>
    )
};

export default ProductForm;
