import React, { createContext, useState, useEffect, useContext } from 'react';
import { cartService } from '../services/apiService';
import { useAuth } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({
    items_count: 0,
    total_quantity: 0,
    total_amount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { isAuthenticated, user } = useAuth();
  
  // Cargar el carrito cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated()) {
      fetchCart();
    } else {
      // Resetear el carrito cuando el usuario no está autenticado
      setCart(null);
      setItems([]);
      setSummary({
        items_count: 0,
        total_quantity: 0,
        total_amount: 0
      });
      setLoading(false);
    }
  }, [isAuthenticated, user]);
  
  // Función para obtener el carrito del usuario
  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await cartService.getCart();
      
      setCart(data.cart);
      setItems(data.items);
      setSummary(data.summary);
      setError(null);
    } catch (err) {
      console.error('Error al obtener el carrito:', err);
      setError('No se pudo cargar el carrito. Por favor, intente más tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  // Añadir un producto al carrito
  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated()) {
      // Redireccionar al login o mostrar un mensaje
      return { success: false, message: 'Debe iniciar sesión para agregar productos al carrito' };
    }
    
    // Verificar si hay token disponible
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No hay token disponible para hacer la petición al carrito');
      return { success: false, message: 'Error de autenticación. Por favor, inicie sesión nuevamente.' };
    }
    
    try {
      setLoading(true);
      const data = await cartService.addToCart(productId, quantity);
      
      // Actualizar el estado del carrito
      setCart(data.cart);
      setItems(prevItems => {
        // Verificar si el producto ya existe en el carrito
        const existingItemIndex = prevItems.findIndex(item => item.id_producto === parseInt(productId));
        
        if (existingItemIndex >= 0) {
          // Actualizar el item existente
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex] = data.item;
          return updatedItems;
        } else {
          // Agregar el nuevo item
          return [...prevItems, data.item];
        }
      });
      setSummary(data.summary);
      
      return { success: true, message: 'Producto agregado al carrito' };
    } catch (err) {
      console.error('Error al agregar producto al carrito:', err);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Actualizar la cantidad de un producto en el carrito
  const updateQuantity = async (itemId, quantity) => {
    try {
      setLoading(true);
      const data = await cartService.updateQuantity(itemId, quantity);
      
      // Actualizar el estado del carrito
      setItems(prevItems => prevItems.map(item => 
        item.id_item_carrito === parseInt(itemId) ? data.item : item
      ));
      setSummary(data.summary);
      
      return { success: true, message: 'Cantidad actualizada' };
    } catch (err) {
      console.error('Error al actualizar cantidad:', err);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Eliminar un producto del carrito
  const removeItem = async (itemId) => {
    try {
      setLoading(true);
      await cartService.removeItem(itemId);
      
      // Actualizar el estado del carrito
      setItems(prevItems => prevItems.filter(item => item.id_item_carrito !== parseInt(itemId)));
      
      // Recalcular el resumen
      fetchCart();
      
      return { success: true, message: 'Producto eliminado del carrito' };
    } catch (err) {
      console.error('Error al eliminar producto del carrito:', err);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Vaciar el carrito
  const clearCart = async () => {
    try {
      setLoading(true);
      await cartService.clearCart();
      
      // Actualizar el estado del carrito
      setItems([]);
      setSummary({
        items_count: 0,
        total_quantity: 0,
        total_amount: 0
      });
      
      return { success: true, message: 'Carrito vaciado' };
    } catch (err) {
      console.error('Error al vaciar el carrito:', err);
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    cart,
    items,
    summary,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart: fetchCart
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
