import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDailySuggestion } from '../../services/dailySuggestionService';
import { fetchPantry, fetchLowQuantityItems, Pantry } from '../../services/pantryService';
import  { useUser } from '../../context/UserContext';
import PantryCard from '../../components/Pantry/PantryCard';
import { Dish } from '../../services/dishService';
import './Home.css';

const Home: React.FC = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [dailySuggestion, setDailySuggestion] = useState<Dish>();
    const [pantry, setPantry] = useState<Pantry[]>([]);

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        async function fetchData() {
            if (user) {
                const pant = await fetchPantry({ userId: user.id, page: 0 });
                if (pant) {
                    const pantryWithLowItem = await Promise.all(pant?.map(async (invent: Pantry) => {
                        const lowItem = await fetchLowQuantityItems(invent?.id, 5);
                        if (lowItem) {
                            return {
                                ...invent,
                                lowQuantityItems: lowItem,
                            }
                        }
                    }))
                    setPantry(pantryWithLowItem);
                }
            }

            const daily = await fetchDailySuggestion(1);
            if (daily) {
                // const dailyWithImages = await Promise.any(daily?.map(async (dish: Dish) => {
                //     if (typeof dish.image === 'object' && dish.image.id) {
                //         const imageResponse = await fetchDishImage(dish.image.id);
                //         if (imageResponse) {
                //             return {
                //                 ...dish,
                //                 image: imageResponse.image
                //             };
                //         }
                //     }
                //     return dish;
                // }));
                // setDailySuggestion(dailyWithImages);
            }
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
                            src={typeof dailySuggestion.image === 'string' && require(dailySuggestion.image)}
                            alt="Suggested Dish"
                            className="suggestion-image"
                        />
                    </div>
                )}
            </section>
            <section className="home-pantry-section">
                <h2>Dispensas</h2>
                <div className="home-pantry-cards">
                    {pantry?.map((pant, index) => (
                        <PantryCard pant={pant} key={index} onClick={()=>{navigate(`/pantry/${pant.id}`)}} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;