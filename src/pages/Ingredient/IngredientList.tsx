import React, { useState, useEffect } from 'react';
import { fetchIngredients, Ingredient, IngredientType } from '../../services/ingredients/ingredientsService'; // Replace with your actual service
import { fetchIngredientCategories, IngredientCategory } from '../../services/ingredients/ingredientCategoryService';

const IngredientList: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<IngredientCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<IngredientType | null>(null);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

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
    async function loadIngredients() {
      try {
        const response = await fetchIngredients({
          page,
          categoryId: selectedCategory,
          type: selectedType,
        });
        setIngredients(response.content);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('Error loading ingredients:', error);
        alert('Error loading ingredients.');
      }
    }
    loadIngredients();
  }, [page, selectedCategory, selectedType]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value ? Number(e.target.value) : null);
    setPage(0);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value as IngredientType | null);
    setPage(0);
  };
  
  const handlePreviousPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  };

  return (
    <div>
      <h2>Ingredient List</h2>

      <div>
        <label>Category:</label>
        <select value={selectedCategory || ''} onChange={handleCategoryChange}>
          <option value="">All</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <label>Type:</label>
        <select value={selectedType || ''} onChange={handleTypeChange}>
          <option value="">All</option>
          <option value="USABLE">Usable</option>
          <option value="INDUSTRIAL">Industrial</option>
        </select>
      </div>

      <ul>
        {ingredients.map((ingredient) => (
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
          </li>
        ))}
      </ul>

      <div>
        <button onClick={handlePreviousPage} disabled={page === 0}>
          Previous
        </button>
        <span>
          Page {page + 1} of {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={page === totalPages - 1}>
          Next
        </button>
      </div>
    </div>
  );
};

export default IngredientList;
