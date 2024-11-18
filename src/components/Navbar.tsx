import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="navbar">
      <div className="logo">
        <Link to="/Home">
          <span className='highlight-dark-green'>FOOD<span className='highlight-green'>FLOW</span></span>
        </Link>
      </div>
      <div className="navbar-menu" role="navigation" aria-label="Main menu">
        <Link to="/Home" className={`navbar-item ${location.pathname === '/Home' ? 'active' : ''}`}>INICIO</Link>
        <Link to="/pantry" className={`navbar-item ${location.pathname === '/pantry' ? 'active' : ''}`}>DISPENSA</Link>
        <Link to="/menu" className={`navbar-item ${location.pathname === '/menu' ? 'active' : ''}`}>MENU</Link>
      </div>
    </div>
  );
};

export default Navbar;
