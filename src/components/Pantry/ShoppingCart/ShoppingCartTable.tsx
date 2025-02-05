import React, { useState } from "react";
import { FaTrash, FaPlus } from "react-icons/fa";
import "../../../styles/components/Shopping/ShoppingCartTable.css";
import { ShoppingCartItem } from "../../../services/shopping/shoppingCartService";
import ItemSelectionModal from "../../ShoppingListItem/ItemSelectionModal/ItemSelectionModal";
import { ShoppingListItem } from "../../../services/shopping/shoppingListService";

interface ShoppingCartTableProps {
    items: ShoppingCartItem[];
    availableItems: { id: number; name: string }[];
    onUpdateItem: (item: ShoppingCartItem) => void;
    onRemoveItem: (itemId: number) => void;
    onAddItems: (selectedItems: ShoppingListItem[]) => void;
}

const ShoppingCartTable: React.FC<ShoppingCartTableProps> = ({
    items,
    availableItems,
    onUpdateItem,
    onRemoveItem,
    onAddItems,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        item: ShoppingCartItem,
        field: "cartQuantity" | "price" | "unityPrice"
    ) => {
        const newValue = parseFloat(e.target.value) || 0;
        let updatedItem = { ...item };
    
        switch (field) {
            case "cartQuantity":
                updatedItem.cartQuantity = newValue;
                if (updatedItem.unityPrice) {
                    updatedItem.price = updatedItem.cartQuantity * updatedItem.unityPrice;
                } else if (updatedItem.price) {
                    updatedItem.unityPrice = updatedItem.price / updatedItem.cartQuantity;
                }
                break;
    
            case "unityPrice":
                updatedItem.unityPrice = newValue;
                if (updatedItem.cartQuantity) {
                    updatedItem.price = updatedItem.cartQuantity * updatedItem.unityPrice;
                }
                break;
    
            case "price":
                updatedItem.price = newValue;
                if (updatedItem.cartQuantity) {
                    updatedItem.unityPrice = updatedItem.price / updatedItem.cartQuantity;
                }
                break;
    
            default:
                break;
        }
    
        // Chama a função para atualizar o item com os novos valores calculados
        onUpdateItem(updatedItem);
    };
    


    return (
        <div>
            <table className="shopping-cart-table">
                <thead>
                    <tr>
                        <th>Nome do Produto</th>
                        <th>Quantidade Necessária</th>
                        <th>Quantidade no Carrinho</th>
                        <th>Preço Unitário (R$)</th>
                        <th>Preço Total (R$)</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {items
                        .slice()
                        .sort((a, b) => a.id - b.id) // Ensure items are ordered by ID
                        .map((item) => (
                            <tr key={item.id}>
                                <td>{item.ingredient.name}</td>
                                <td>{item.plannedQuantity}</td>
                                <td>
                                    <input
                                        type="number"
                                        value={item.cartQuantity}
                                        onChange={(e) =>
                                            handleInputChange(e, item, "cartQuantity")
                                        }
                                        min="0"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={item.unityPrice}
                                        onChange={(e) =>
                                            handleInputChange(e, item, "unityPrice")
                                        }
                                        step="0.01"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={item.price}
                                        onChange={(e) =>
                                            handleInputChange(e, item, "price")
                                        }
                                        step="0.01"
                                    />
                                </td>
                                <td>
                                    <button
                                        className="remove-button"
                                        onClick={() => onRemoveItem(item.id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "10px" }}>
                            <button className="add-items-button" onClick={() => setIsModalOpen(true)}>
                                <FaPlus /> Adicionar Itens
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            {isModalOpen && (
                <ItemSelectionModal
                    availableItems={availableItems}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={onAddItems}
                />
            )}
        </div>
    );
};

export default ShoppingCartTable;
