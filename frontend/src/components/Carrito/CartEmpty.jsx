import React from 'react';
import { Link } from 'react-router-dom';

const CartEmpty = () => {
  return (
    <div className="cart-page__empty">
      <div className="cart-page__empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
      </div>
      <h2 className="cart-page__empty-message">Tu carrito está vacío</h2>
      <p>Parece que aún no has añadido productos a tu carrito.</p>
      <Link to="/productos" className="cart-page__empty-button">
        Explorar productos
      </Link>
    </div>
  );
};

export default CartEmpty;
