import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import './AccessDenied.css';

const AccessDenied = () => {
  const location = useLocation();
  const error = location.state?.error || 'No tiene acceso a esta página';

  return (
    <div className="escomparte">
      <Header />
      <div className="escomparte__container">
        <div className="access-denied">
          <div className="access-denied__content">
            <h1 className="access-denied__title">Acceso Denegado</h1>
            <div className="access-denied__icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
            <p className="access-denied__message">{error}</p>
            <div className="access-denied__actions">
              <Link to="/" className="access-denied__button access-denied__button--primary">
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AccessDenied;
