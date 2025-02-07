import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Suggestion from './pages/Suggestion/Suggestion';
import './App.css'; 

// Importe as imagens de fundo
import homeBackground from './assets/fotos/food-background.jpg';
import loginBackground from './assets/fotos/food-background.jpg';
import suggestionBackground from './assets/fotos/food-background.jpg';
import pantryBackground from './assets/fotos/food-background.jpg';

import LowQuantityItems from './components/Pantry/LowQuantityItems';
import { UserProvider } from './context/UserContext';
import PantryPage from './pages/Pantry/Pantries';
import PlanDay from './pages/PlanDay/PlanDay';
import Menus from './pages/Menu/Menus';
import PantryDetail from './pages/Pantry/PantryDetail';
import Navbar from './layouts/Navbar/Navbar';
import ShoppingCart from './pages/Pantry/ShoppingCart/ShoppingCart';
import MenuDetail from './pages/Menu/MenuDetail';

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
        setBackgroundImage(pantryBackground);
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
          <Route path="/menus" element={<Menus />} />
          <Route path="/menu/:id" element={<MenuDetail />} />
          <Route path="/plan-day/:pantryId" element={<PlanDay />} />
          <Route path="/suggestion" element={<Suggestion />} />
          <Route path="/pantries" element={<PantryPage />} />
          <Route path="/pantry/:id" element={<PantryDetail />} />
          <Route path="/pantry/:pantryId/low-quantity" element={<LowQuantityItems />} />
          <Route path="/shopping-cart/:id" element={<ShoppingCart />} />
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
