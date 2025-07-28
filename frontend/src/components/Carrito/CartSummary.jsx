import React, { useContext, useState } from 'react';
import { CartContext } from '../../contexts/CartContext';

const CartSummary = () => {
  const { summary } = useContext(CartContext);
  const [checkingOut, setCheckingOut] = useState(false);
  
  // La función de checkout se implementará después cuando esté lista la funcionalidad de pagos
  const handleCheckout = () => {
    setCheckingOut(true);
    
    // Aquí iría la redirección al proceso de pago
    alert('Funcionalidad de checkout en desarrollo');
    
    setCheckingOut(false);
  };
  
  return (
    <div className="cart-summary">
      <h2 className="cart-summary__title">Resumen de compra</h2>
      
      <div className="cart-summary__row">
        <span className="cart-summary__label">Productos</span>
        <span className="cart-summary__value">{summary.items_count || 0}</span>
      </div>
      
      <div className="cart-summary__row">
        <span className="cart-summary__label">Cantidad de artículos</span>
        <span className="cart-summary__value">{summary.total_quantity || 0}</span>
      </div>
      
      <div className="cart-summary__row">
        <span className="cart-summary__label">Subtotal</span>
        <span className="cart-summary__value">${parseFloat(summary.total_amount || 0).toFixed(2)} MXN</span>
      </div>
      
      {/* Envío y otros conceptos se agregarán después */}
      
      <div className="cart-summary__row">
        <span className="cart-summary__label">Total</span>
        <span className="cart-summary__value cart-summary__total">${parseFloat(summary.total_amount || 0).toFixed(2)} MXN</span>
      </div>
      
      <button 
        className="cart-summary__checkout" 
        onClick={handleCheckout}
        disabled={checkingOut || !summary.items_count}
      >
        {checkingOut ? 'Procesando...' : 'Proceder al pago'}
      </button>
      
      <p className="cart-summary__note">
        Los productos se enviarán a la ubicación proporcionada en el proceso de pago
      </p>
    </div>
  );
};

export default CartSummary;
