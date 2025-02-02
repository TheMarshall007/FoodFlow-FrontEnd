import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../../styles/Navbar.module.css';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className={styles.navbar} role="navigation" aria-label="Main menu">
      <div className={styles['navbar-logo']}>
        <Link to="/Home">
          <span className={styles['highlight-dark-green']}>FOOD<span className={styles['highlight-green']}>FLOW</span></span>
        </Link>
      </div>
      <div className={styles['navbar-menu']}>
        <Link to="/Home" className={`${styles['navbar-item']} ${location.pathname === '/Home' ? styles.active : ''}`}>INICIO</Link>
        <Link to="/pantries" className={`${styles['navbar-item']} ${location.pathname === '/pantries' ? styles.active : ''}`}>DISPENSA</Link>
        <Link to="/menu" className={`${styles['navbar-item']} ${location.pathname === '/menu' ? styles.active : ''}`}>MENU</Link>
        <Link to="/shopping" className={`${styles['navbar-item']} ${location.pathname === '/shopping' ? styles.active : ''}`}>COMPRAS</Link>
      </div>
    </nav>
  );
};

export default Navbar;
