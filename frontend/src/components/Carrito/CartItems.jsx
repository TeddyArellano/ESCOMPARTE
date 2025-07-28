import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../../contexts/CartContext';
import placeholderImage from '../../assets/images/placeholder-component.svg';

const CartItems = () => {
  const { items, updateQuantity, removeItem } = useContext(CartContext);
  const [updatingItem, setUpdatingItem] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);
  const [message, setMessage] = useState(null);

  // Función para actualizar la cantidad
  const handleQuantityChange = async (itemId, newQuantity, existencia) => {
    // Validar límites de cantidad
    if (newQuantity < 1 || newQuantity > existencia) {
      return;
    }
    
    setUpdatingItem(itemId);
    
    try {
      const result = await updateQuantity(itemId, newQuantity);
      
      if (!result.success) {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      setMessage({ type: 'error', text: 'Error al actualizar la cantidad' });
    } finally {
      setUpdatingItem(null);
      
      // Ocultar mensaje después de 3 segundos
      if (message) {
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      }
    }
  };

  // Función para eliminar un producto
  const handleRemoveItem = async (itemId) => {
    if (window.confirm('¿Está seguro que desea eliminar este producto del carrito?')) {
      setRemovingItem(itemId);
      
      try {
        const result = await removeItem(itemId);
        
        if (!result.success) {
          setMessage({ type: 'error', text: result.message });
        }
      } catch (err) {
        console.error('Error removing item:', err);
        setMessage({ type: 'error', text: 'Error al eliminar el producto' });
      } finally {
        setRemovingItem(null);
        
        // Ocultar mensaje después de 3 segundos
        if (message) {
          setTimeout(() => {
            setMessage(null);
          }, 3000);
        }
      }
    }
  };

  return (
    <div className="cart-items">
      {message && (
        <div className={`cart-message cart-message--${message.type}`}>
          {message.text}
        </div>
      )}
      
      <table className="cart-items__table">
        <thead className="cart-items__header">
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Cantidad</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr 
              key={item.id_item_carrito} 
              className={`cart-items__row ${updatingItem === item.id_item_carrito || removingItem === item.id_item_carrito ? 'cart-items__loading' : ''}`}
            >
              <td className="cart-items__cell">
                <div className="cart-items__product">
                  <img 
                    className="cart-items__image" 
                    src={item.imagen_optimizada 
                      ? `http://localhost:8080/uploads/productos/${item.imagen_optimizada}` 
                      : (item.imagen_principal || placeholderImage)} 
                    alt={item.nombre || 'Producto'} 
                  />
                  <div className="cart-items__info">
                    <h3 className="cart-items__name">
                      <Link to={`/productos/${item.id_producto}`}>{item.nombre || 'Producto sin nombre'}</Link>
                    </h3>
                    <p className="cart-items__description">{item.descripcion ? `${item.descripcion.slice(0, 60)}...` : 'Sin descripción'}</p>
                    <small>Estado: {item.estado ? (item.estado === 'nuevo' ? 'Nuevo' : 'Usado') : 'N/A'}</small>
                  </div>
                </div>
              </td>
              <td className="cart-items__cell cart-items__price">
                ${parseFloat(item.precio_unitario || 0).toFixed(2)} MXN
              </td>
              <td className="cart-items__cell">
                <div className="cart-items__quantity-control">
                  <button 
                    className="cart-items__quantity-btn" 
                    onClick={() => handleQuantityChange(item.id_item_carrito, item.cantidad - 1, item.existencia)}
                    disabled={item.cantidad <= 1 || updatingItem === item.id_item_carrito}
                  >
                    -
                  </button>
                  <span className="cart-items__quantity-value">{item.cantidad}</span>
                  <button 
                    className="cart-items__quantity-btn" 
                    onClick={() => handleQuantityChange(item.id_item_carrito, item.cantidad + 1, item.existencia)}
                    disabled={item.cantidad >= item.existencia || updatingItem === item.id_item_carrito}
                  >
                    +
                  </button>
                </div>
                <small>{item.existencia || 0} disponibles</small>
              </td>
              <td className="cart-items__cell cart-items__total">
                ${(parseFloat(item.precio_unitario || 0) * parseInt(item.cantidad || 1, 10)).toFixed(2)} MXN
              </td>
              <td className="cart-items__cell cart-items__actions">
                <button 
                  className="cart-items__remove-btn" 
                  onClick={() => handleRemoveItem(item.id_item_carrito)}
                  disabled={removingItem === item.id_item_carrito}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CartItems;
