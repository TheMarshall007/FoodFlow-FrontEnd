// src/pages/Home/Home.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDailySuggestion } from '../../services/dailySuggestion';
import { fetchInventory, fetchLowQuantityItems } from '../../services/inventoryService';
import { fetchSuggestedDishes } from '../../services/suggestionService';
import { fetchDishImage } from '../../services/dishImageService';
import './Home.css';
import RecipeModal from '../../src/components/RecipeModal';
import { useUser } from '../../src/context/UserContext';

interface Dish {
    id: number;
    name: string;
    description: string;
    ingredientsId: number[];
    image?: string | { id: number };
    steps: string[];
}

interface Inventory {
    id: number;
    propertyName: string;
    items: InventoryItem[];
    lastUpdated: string;
    lowQuantityItems: InventoryItem[];
}

interface InventoryItem {
    ingredient: {
        name: string;
        status: string;
    }
    quantity: number;
}

const Home: React.FC = () => {
    const { user } = useUser(); // Desestruturando apenas `user`
    const navigate = useNavigate();
    const [dailySuggestion, setDailySuggestion] = useState<Dish[]>([]);
    const [suggestedDishes, setSuggestedDishes] = useState<Dish[]>([]);
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

    useEffect(() => {
        // Verifica se o usuário está autenticado
        if (!user) {
            navigate('/'); // Redireciona para o login se `user` for null
            return;
        }

        async function fetchData() {
            const daily = await fetchDailySuggestion(1);
            const dishes = await fetchSuggestedDishes(1);
            let inv = []
            let inventoryWithLowItem = []
            if (user) {
                inv = await fetchInventory({ userId: user.id, inventoryId: 1, page: 0 });
                inventoryWithLowItem = await Promise.all(inv?.map(async (invent: Inventory) => {
                    const lowItem = await fetchLowQuantityItems(invent?.id, 5);
                    return {
                        ...invent,
                        lowQuantityItems: lowItem
                    }
                }))
            }

            const dailyWithImages = await Promise.all(daily.map(async (dish: Dish) => {
                if (typeof dish.image === 'object' && dish.image.id) {
                    const imageResponse = await fetchDishImage(dish.image.id);
                    return {
                        ...dish,
                        image: `data:image/${imageResponse.type};base64,${imageResponse.image}`,
                    };
                }
                return dish;
            }));

            const suggestedWithImages = await Promise.all(dishes.map(async (item: Dish) => {
                if (typeof item.image === 'object' && item.image.id) {
                    const imageResponse = await fetchDishImage(item.image.id);
                    return {
                        ...item,
                        image: `data:image/${imageResponse.type};base64,${imageResponse.image}`,
                    };
                }
                return item;
            }));

            setDailySuggestion(dailyWithImages);
            setSuggestedDishes(suggestedWithImages);
            setInventory(inventoryWithLowItem);
        }

        fetchData();
    }, [user, navigate]); // Adiciona `user` e `navigate` como dependências


    const renderDishes = (data: Dish[]) => {
        return data.map((item, key) => (
            <div className="dish-info" key={key}>
                {item.image && typeof item.image === 'string' && (
                    <img src={item.image} alt={item.name} className="dish-image" />
                )}
                <div className="dish-content">
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div className="button-group">
                        <button className="button watch-button" onClick={() => handleViewRecipe(item)}>Ver Receita Completa</button>
                    </div>
                </div>
            </div>
        ));
    };

    const handleViewRecipe = (dish: Dish) => {
        setSelectedDish(dish);
        setShowModal(true);
    };

    // Função para navegar até a lista completa de inventários
    const handleViewInventory = () => {
        navigate(`/inventory/1`); // Navegar para a página do inventário do usuário com ID 1
    };

    return (
        <div className="home-container">
            <header className="search-bar">
                <input type="text" placeholder="Procurar..." className="search-input" />
            </header>

            <section className="main-content">
                <div className="highlight-card">
                    <h2>Sugestão do Dia</h2>
                    {dailySuggestion?.length > 0 ? (
                        renderDishes(dailySuggestion)
                    ) : (
                        <p>Carregando sugestão...</p>
                    )}
                </div>

                <div className="recommended-section">
                    <h2>Você também pode gostar</h2>
                    <div className="recommendation-grid">
                        {suggestedDishes?.length >= 0 ? (
                            renderDishes(suggestedDishes)
                        ) : (
                            <p>Carregando recomendações...</p>
                        )}
                    </div>
                </div>
            </section>

            <aside className="side-panel">
                <h3>Inventário</h3>
                <ul className="inventory-list">
                    {inventory && inventory.length > 0 ? (
                        inventory.map((item, index) => (
                            <div key={index}>
                                <li>
                                    <strong>{item.propertyName}</strong>
                                </li>
                                <div>
                                    {item.lowQuantityItems && item.lowQuantityItems.length > 0 ? (
                                        item.lowQuantityItems.map((itemLow, indexLow) => (
                                            <li key={indexLow}>
                                                {itemLow.ingredient.name} - Quantidade: {itemLow.quantity}
                                            </li>
                                        ))
                                    ) : (
                                        <p>Sem itens com baixa quantidade.</p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Carregando inventário...</p>
                    )}
                </ul>
                {/* Botão para visualizar o inventário completo */}
                <button className="button view-inventory-button" onClick={handleViewInventory}>
                    Ver Inventário Completo
                </button>
            </aside>


            {/* Modal para exibir a receita completa */}
            {selectedDish && (
                <RecipeModal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    name={selectedDish.name}
                    description={selectedDish.description}
                    ingredientsId={selectedDish.ingredientsId}
                    steps={selectedDish.steps}
                />
            )}
        </div>
    );
};

export default Home;
