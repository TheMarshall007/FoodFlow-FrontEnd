import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import  { useUser } from '../../context/UserContext';
import PantryCard from '../../components/Pantry/PantryCard';
import { Dish } from '../../services/dish/dishService';
import '../../styles/pages/Home/Home.css';
import { fetchLowQuantityProducts, fetchPantry, Pantry } from '../../services/pantry/pantryService';
import { fetchDailySuggestion } from '../../services/suggestion/dailySuggestionService';
import { fetchDishImage } from '../../services/dish/dishImageService';

const Home: React.FC = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const [dailySuggestion, setDailySuggestion] = useState<Dish>();
    const [pantry, setPantry] = useState<Pantry[]>([]);
    const hasFetched = useRef(false); // Controle de execução

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }

        async function fetchData() {
            if (!hasFetched.current && user) {
                hasFetched.current = true; // Marca como executado

                const pant = await fetchPantry({ userId: user.id, page: 0 });
                if (pant) {
                    const pantryWithLowProduct = await Promise.all(pant.map(async (invent: Pantry) => {
                        const lowProduct = await fetchLowQuantityProducts(invent?.id, 5);
                        return {
                            ...invent,
                            lowQuantityProducts: lowProduct,
                        }
                    }));
                    setPantry(pantryWithLowProduct);

                    const daily = pant.length > 0
                        ? await fetchDailySuggestion(pant[0].id)
                        : null;
                    const suggestion = Array.isArray(daily) ? daily[0] : daily;

                    if (suggestion) {
                        let image = suggestion.image;
                        if (image?.id && (!image.image || !image.type)) {
                            const images = await fetchDishImage([image.id]);
                            image = images.find((item: { id: number }) => item.id === image.id) || image;
                        }
                        setDailySuggestion({ ...suggestion, image });
                    }
                }
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
                        {dailySuggestion.image?.image && dailySuggestion.image?.type && (
                            <img
                                src={`data:image/${dailySuggestion.image.type};base64,${dailySuggestion.image.image}`}
                                alt={dailySuggestion.name}
                                className="suggestion-image"
                            />
                        )}
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
