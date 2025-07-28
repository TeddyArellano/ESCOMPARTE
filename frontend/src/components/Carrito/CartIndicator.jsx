import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../contexts/CartContext';

const CartIndicator = () => {
  const { summary } = useContext(CartContext);
  const [hasUpdated, setHasUpdated] = useState(false);
  
  // Animación cuando cambia la cantidad de productos
  useEffect(() => {
    if (summary.total_quantity > 0) {
      setHasUpdated(true);
      
      const timer = setTimeout(() => {
        setHasUpdated(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [summary.total_quantity]);
  
  return (
    <Link to="/carrito" className={`cart-indicator ${hasUpdated ? 'cart-indicator--updated' : ''}`}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/>
        <circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
      {summary.total_quantity > 0 && (
        <span className="cart-indicator__count">
          {summary.total_quantity > 99 ? '99+' : summary.total_quantity}
        </span>
      )}
    </Link>
  );
};

export default CartIndicator;
