import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Header.css";
// Las fuentes Google se importan desde index.html
import logoImage from "../../assets/logo.jpg"; // Asegúrate de que la ruta sea correcta
import { CartIndicator } from "../Carrito";

const Logo = () => (
  <div className="escomparte__logo">
    <img src={logoImage} alt="ESCOMPARTE" className="escomparte__logo-image" />
  </div>
);

const Navigation = () => (
  <nav className="escomparte__nav" aria-label="Main navigation">
    <Link to="/" className="escomparte__nav-link">Inicio</Link>
    <Link to="/productos" className="escomparte__nav-link">Productos</Link>
    <a href="#resources" className="escomparte__nav-link">Recursos</a>
    <a href="#community" className="escomparte__nav-link">Comunidad</a>
    <Link to="/contacto" className="escomparte__nav-link">Contacto</Link>
  </nav>
);

const SearchBar = () => (
  <div className="escomparte__search">
    <label className="escomparte__search-label" htmlFor="search">
      <div className="escomparte__search-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true">
          <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z" />
        </svg>
      </div>
      <input id="search" placeholder="Buscar componentes..." className="escomparte__search-input" />
    </label>
  </div>
);

const Actions = () => {
  const { user, isAuthenticated, isVendor, logout, getUserDisplayName } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  // Cerrar el menú al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <div className="escomparte__actions">
      <div className="escomparte__cart">
        <CartIndicator />
      </div>
      <div className="user-menu-container">
        <button 
          className={`escomparte__button escomparte__button--icon ${showUserMenu ? 'escomparte__button--active' : ''}`} 
          aria-label="User profile"
          onClick={toggleUserMenu}
          aria-expanded={showUserMenu}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true">
            <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z" />
          </svg>
        </button>
        {showUserMenu && (
          <div className="user-menu">
            {isAuthenticated() ? (
              <>
                <div className="user-menu-greeting">
                  ¡Hola {getUserDisplayName()}!
                </div>
                <Link to="/perfil" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                  Mi Perfil
                </Link>
                {isVendor() && (
                  <Link to="/mis-productos" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                    Mis Productos
                  </Link>
                )}
                <Link to="/configuracion" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                  Configuración
                </Link>
                <hr className="user-menu-divider" />
                <button className="user-menu-item user-menu-logout" onClick={handleLogout}>
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                  Iniciar sesión
                </Link>
                <Link to="/registro" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                  Registrarse
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Header = () => (
  <header className="escomparte__header">
    <div className="escomparte__header-container">
      <div className="escomparte__header-left">
        <Logo />
        <Navigation />
      </div>
      <div className="escomparte__header-right">
        <SearchBar />
        <Actions />
      </div>
    </div>
  </header>
);

export default Header;
