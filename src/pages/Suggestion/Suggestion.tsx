import React, { useEffect, useState } from 'react';
import { fetchDishImage } from '../../services/dish/dishImageService';
import './Suggestion.css';
import { fetchDailySuggestion } from '../../services/suggestion/dailySuggestionService';

interface Dish {
    id: number;
    name: string;
    description: string;
    ingredientsId: number[];
    image?: string | { id: number };
    steps: string[];
}

const Suggestion: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);

  useEffect(() => {
    async function fetchData() {
      const daily = await fetchDailySuggestion(1);
      const suggestedWithImages = await Promise.all(daily?.map(async (product: Dish) => {
        if (typeof product.image === 'object' && product.image.id) {
            const imageResponse = await fetchDishImage([product.image.id]);
            return {
                ...product,
                image: `data:image/${imageResponse.type};base64,${imageResponse.image}`,
            };
        }
        return product;
    }));
      setDishes(suggestedWithImages);
    }
    fetchData();
  }, []);

  return (
    <div className="suggestion-container">
      <header className="suggestion-header">
        <h1>Delicious Food is Waiting For You</h1>
        <p>Our selection of daily suggestions just for you!</p>
        <button className="view-menu-button">View Menu</button>
      </header>

      <section className="suggestion-grid">
        {dishes?.map((dish) => (
          <div key={dish.id} className="suggestion-card">
            <img src={`${dish.image}`} alt={dish.name} className="suggestion-image" />
            <div className="suggestion-info">
              <h3>{dish.name}</h3>
              <p>{dish.description}</p>
              <div className="suggestion-footer">
                {/* <span className="suggestion-price">${dish.price}</span> */}
              </div>
            </div>
            <button className="add-cart-button">Add to Cart</button>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Suggestion;
