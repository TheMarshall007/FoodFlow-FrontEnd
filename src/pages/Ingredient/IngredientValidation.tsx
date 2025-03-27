import React, { useState, useEffect } from 'react';
import { fetchIngredients, updateIngredient, Ingredient } from '../../services/ingredients/ingredientsService';

const IngredientValidation: React.FC = () => {
  const [pendingIngredients, setPendingIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    async function loadPendingIngredients() {
      try {
        const response = await fetchIngredients({ page: 0, isValidated: false }); // Added page: 0
        setPendingIngredients(response.content);
      } catch (error) {
        console.error('Error loading pending ingredients:', error);
        alert('Error loading pending ingredients.');
      }
    }
    loadPendingIngredients();
  }, []);

  const handleValidate = async (ingredient: Ingredient) => {
    try {
      await updateIngredient({ ...ingredient, categoryId: ingredient.category.id, isValidated: true }); // Added categoryId
      setPendingIngredients(pendingIngredients.filter((ing) => ing.id !== ingredient.id));
      alert(`Ingredient ${ingredient.name} validated successfully!`);
    } catch (error) {
      console.error('Error validating ingredient:', error);
      alert('Error validating ingredient.');
    }
  };
  const handleReject = async (ingredient: Ingredient) => {
    try {
        await updateIngredient({ ...ingredient, categoryId: ingredient.category.id, isValidated: false, name: `${ingredient.name} (REJEITADO)`}); // Added categoryId
        setPendingIngredients(pendingIngredients.filter((ing) => ing.id !== ingredient.id));
        alert(`Ingredient ${ingredient.name} rejected successfully!`);
      } catch (error) {
        console.error('Error rejecting ingredient:', error);
        alert('Error rejecting ingredient.');
      }
  };

  return (
    <div>
      <h2>Pending Ingredient Validation</h2>
      {pendingIngredients.length > 0 ? (
        <ul>
          {pendingIngredients.map((ingredient) => (
            <li key={ingredient.id}>
              <div>
                <strong>Name:</strong> {ingredient.name}
              </div>
              <div>
                <strong>Category:</strong> {ingredient.category.name}
              </div>
              <div>
                <strong>Type:</strong> {ingredient.type}
              </div>
              <button onClick={() => handleValidate(ingredient)}>Validate</button>
              <button onClick={() => handleReject(ingredient)}>Reject</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No pending ingredients to validate.</p>
      )}
    </div>
  );
};

export default IngredientValidation;
