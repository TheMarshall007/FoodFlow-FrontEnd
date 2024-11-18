import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDailySuggestion } from '../../services/dailySuggestionService';
import { fetchPantry, fetchLowQuantityItems } from '../../services/pantryService';
import { fetchDishImage } from '../../services/dishImageService';
import './Home.css';
import User, { useUser } from '../../context/UserContext';
import PantryCard from '../../components/Pantry/PantryCard';

interface Dish {
    id: number;
    name: string;
    description: string;
    ingredientsId: number[];
    image?: string | { id: number };
    steps: string[];
}

interface Pantry {
    id: number;
    propertyName: string;
    items: PantryItem[];
    sharedWith: User[];
    lastUpdated: string;
    lowQuantityItems: PantryItem[];
}

interface PantryItem {
    ingredient: {
        name: string;
        status: string;
    }
    quantity: number;
}

const Home: React.FC = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [dailySuggestion, setDailySuggestion] = useState<Dish>();
    const [inventory, setPantry] = useState<Pantry[]>([]);

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        async function fetchData() {
            const daily = await fetchDailySuggestion(1);

            let inventoryWithLowItem = []
            if (user) {
                const inv = await fetchPantry({ userId: user.id, inventoryId: 1, page: 0 });
                inventoryWithLowItem = await Promise.all(inv?.map(async (invent: Pantry) => {
                    const lowItem = await fetchLowQuantityItems(invent?.id, 5);
                    return {
                        ...invent,
                        lowQuantityItems: lowItem,
                        sharedWith: [{
                            id: 1,
                            name: 'leo',
                            email: 'leo',
                            picture: ''
                        }, {
                            id: 2,
                            name: 'leo',
                            email: 'leo',
                            picture: ''
                        }]
                    }
                }))
            }

            const dailyWithImages = await Promise.any(daily.map(async (dish: Dish) => {
                if (typeof dish.image === 'object' && dish.image.id) {
                    const imageResponse = await fetchDishImage(dish.image.id);
                    return {
                        ...dish,
                        image: `data:image/${imageResponse.type};base64,${imageResponse.image}`,
                    };
                }
                return dish;
            }));

            setDailySuggestion(dailyWithImages);
            setPantry(inventoryWithLowItem);
        }

        fetchData();
    }, [user, navigate]);

    return (
        <div className="home-container">
            <section className="suggestion-section">
                <h2 className="suggestion-title">Sugestão do dia</h2>
                {dailySuggestion && (
                    <div className="suggestion-card">
                        <div className="suggestion-content">
                            <div className="suggestion-text">
                                <h3 className="dish-name">{dailySuggestion.name}</h3>
                                <p className="dish-description">{dailySuggestion.description}</p>
                                <div className="buttons">
                                    <button className="button-orange">Ver Receita</button>
                                    <button className="button-blue">Sugestões do dia</button>
                                </div>
                            </div>
                        </div>
                        <img
                            src={typeof dailySuggestion.image === 'string' ? require('../../assets/fotos/strogonoff.png') : require('../../assets/fotos/strogonoff.png')}
                            alt="Suggested Dish"
                            className="suggestion-image"
                        />
                    </div>
                )}
            </section>

            <section className="home-pantry-section">
                <h2>Dispensas</h2>
                <div className="home-pantry-cards">
                    {inventory.map((inv, index) => (
                        <PantryCard inv={{ ...inv, image: require('../../assets/fotos/summer-beach-house.png') }} key={index} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
