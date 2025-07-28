import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import { CartContext } from '../../contexts/CartContext';
import './Carrito.css';
import CartItems from './CartItems';
import CartSummary from './CartSummary';
import CartEmpty from './CartEmpty';

const Carrito = () => {
  const { items, summary, loading, error, clearCart } = useContext(CartContext);
  const [message, setMessage] = useState(null);
  const [isClearing, setIsClearing] = useState(false);
  
  // Mostrar mensaje de error si existe
  useEffect(() => {
    if (error) {
      setMessage({ type: 'error', text: error });
    }
  }, [error]);
  
  // Función para vaciar el carrito
  const handleClearCart = async () => {
    if (window.confirm('¿Está seguro que desea vaciar el carrito?')) {
      setIsClearing(true);
      
      try {
        const result = await clearCart();
        
        if (result.success) {
          setMessage({ type: 'success', text: 'El carrito se ha vaciado correctamente' });
        } else {
          setMessage({ type: 'error', text: result.message || 'Error al vaciar el carrito' });
        }
      } catch (err) {
        console.error('Error clearing cart:', err);
        setMessage({ type: 'error', text: 'Error al vaciar el carrito' });
      } finally {
        setIsClearing(false);
        
        // Ocultar el mensaje después de 3 segundos
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      }
    }
  };
  
  return (
    <div className="escomparte">
      <Header />
      <div className="escomparte__container">
        <main className="cart-page">
          <div className="cart-page__header">
            <h1 className="cart-page__title">Mi Carrito</h1>
            <div className="cart-page__buttons">
              <Link to="/productos" className="cart-page__continue-shopping">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Seguir comprando
              </Link>
              {items.length > 0 && (
                <button 
                  className="cart-page__clear-cart" 
                  onClick={handleClearCart}
                  disabled={isClearing || loading}
                >
                  {isClearing ? 'Vaciando...' : 'Vaciar carrito'}
                </button>
              )}
            </div>
          </div>
          
          {message && (
            <div className={`cart-message cart-message--${message.type}`}>
              {message.text}
            </div>
          )}
          
          {loading && (
            <div className="cart-page__loading">
              <p>Cargando carrito...</p>
            </div>
          )}
          
          {!loading && (
            <>
              {items.length === 0 ? (
                <CartEmpty />
              ) : (
                <div className="cart-page__content">
                  <CartItems />
                  <CartSummary />
                </div>
              )}
            </>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Carrito;
