import React, { useState, useEffect } from 'react';
import { createIngredient, Ingredient, IngredientType, updateIngredient } from '../../services/ingredients/ingredientsService';
import { fetchIngredientCategories, IngredientCategory } from '../../services/ingredients/ingredientCategoryService';

interface IngredientFormProps {
  onClose: () => void;
  ingredient?: Ingredient;
}

const IngredientForm: React.FC<IngredientFormProps> = ({ onClose, ingredient }) => {
  const [name, setName] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [type, setType] = useState<IngredientType>('USABLE');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [categories, setCategories] = useState<IngredientCategory[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const categoriesData = await fetchIngredientCategories({ page: 0 });
        setCategories(categoriesData.content);
      } catch (error) {
        console.error('Error loading ingredient categories:', error);
        alert('Error loading ingredient categories.');
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (ingredient) {
      setIsEditing(true);
      setName(ingredient.name);
      setSelectedCategory(ingredient.category.id);
      setType(ingredient.type);
    }
  }, [ingredient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const ingredientData = {
      name,
      categoryId: selectedCategory,
      type,
      isValidated: false, // Default to false for new ingredients
    };

    try {
      if (isEditing && ingredient) {
        await updateIngredient({ ...ingredientData, id: ingredient.id });
        alert('Ingredient updated successfully!');
      } else {
        await createIngredient(ingredientData);
        alert('Ingredient created successfully!');
      }
      onClose();
    } catch (error: any) {
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Error creating/updating ingredient.');
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>X</button>
        <h2>{isEditing ? 'Edit Ingredient' : 'Add New Ingredient'}</h2>
        <form onSubmit={handleSubmit}>
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />

          <label>Category:</label>
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
            required
          >
            <option value="">Select a Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <label>Type:</label>
          <select value={type} onChange={(e) => setType(e.target.value as IngredientType)} required>
            <option value="USABLE">Usable</option>
            <option value="INDUSTRIAL">Industrial</option>
          </select>

          <button type="submit">{isEditing ? 'Update Ingredient' : 'Create Ingredient'}</button>
        </form>
      </div>
    </div>
  );
};

export default IngredientForm;
