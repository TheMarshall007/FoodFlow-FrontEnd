// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Suggestion from './pages/Suggestion/Suggestion';
import './App.css'; // Certifique-se de adicionar o estilo da imagem de fundo borrada aqui

// Importe as imagens de fundo
import homeBackground from './assets/fotos/food-background.jpg';
import loginBackground from './assets/fotos/food-background.jpg';
import suggestionBackground from './assets/fotos/food-background.jpg';
import inventoryBackground from './assets/fotos/food-background.jpg';

import LowQuantityItems from './components/Pantry/LowQuantityItems';
import RecipeModal from './components/RecipeModal';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import PantryPage from './pages/Pantry/Pantries';
import PlanDay from './pages/PlanDay/PlanDay';
import Menus from './pages/Menu/Menus';

// Componente que gerencia a imagem de fundo
function AppContent() {
  const location = useLocation();
  const [backgroundImage, setBackgroundImage] = useState(homeBackground);

  // Atualiza a imagem de fundo conforme a rota
  useEffect(() => {
    switch (location.pathname) {
      case '/':
        setBackgroundImage(loginBackground);
        break;
      case '/Home':
        setBackgroundImage(homeBackground);
        break;
      case '/suggestion':
        setBackgroundImage(suggestionBackground);
        break;
      case '/pantry':
        setBackgroundImage(inventoryBackground);
        break;
      default:
        setBackgroundImage(homeBackground);
    }
  }, [location]);

  return (
    <div className="app">
      {/* Div para a imagem de fundo com desfoque */}
      <div
        className="background-blur"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/pantry" element={<PantryPage />} />
          <Route path="/menu" element={<Menus />} />
          <Route path="/plan-day/:inventoryId" element={<PlanDay />} />
          <Route path="/pantry/:inventoryId/low-quantity" element={<LowQuantityItems />} />
          <Route path="/suggestion" element={<Suggestion />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

export default App;
