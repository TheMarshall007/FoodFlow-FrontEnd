// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import InventoryList from './src/components/Inventory/InventoryList';
import LowQuantityItems from './src/components/Inventory/LowQuantityItems';
import RecipeModal from './src/components/RecipeModal';
import { UserProvider } from './src/context/UserContext';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="Home" element={<Home />} />

          {/* Tela principal do inventário para um usuário específico */}
          <Route path="/inventory/:userId" element={<InventoryList />} />

          {/* Tela de itens com baixa quantidade */}
          <Route path="/inventory/:inventoryId/low-quantity" element={<LowQuantityItems />} />

          {/* Tela de receita (modal flutuante para ver a receita completa) */}
          <Route path="/recipe/:recipeId" element={
            <RecipeModal
              show={true}
              onClose={() => { }}
              name="Nome da Receita"
              description="Descrição da Receita"
              ingredientsId={[1, 2, 3]}
              steps={["Passo 1", "Passo 2"]}
            />
          } />

        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
