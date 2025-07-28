import cartModel from '../models/cartModel.js';

class CartController {
  // Obtener el carrito del usuario actual
  async getCart(req, res) {
    try {
      const userId = req.user.id;
      
      // Obtener o crear el carrito activo del usuario
      const cart = await cartModel.getUserActiveCart(userId);
      
      // Obtener los items del carrito
      const cartItems = await cartModel.getCartItems(cart.id_carrito);
      
      // Obtener el resumen del carrito
      const cartSummary = await cartModel.getCartSummary(cart.id_carrito);
      
      res.status(200).json({
        success: true,
        data: {
          cart,
          items: cartItems,
          summary: cartSummary
        }
      });
    } catch (error) {
      console.error('Error getting cart:', error);
      res.status(500).json({
        success: false,
        error: 'Error retrieving cart',
        details: error.message
      });
    }
  }

  // Añadir un producto al carrito
  async addToCart(req, res) {
    try {
      const userId = req.user.id;
      const { productId, quantity = 1 } = req.body;
      
      if (!productId) {
        return res.status(400).json({
          success: false,
          error: 'Product ID is required'
        });
      }
      
      if (quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Quantity must be greater than 0'
        });
      }
      
      // Obtener o crear el carrito activo del usuario
      const cart = await cartModel.getUserActiveCart(userId);
      
      // Añadir el producto al carrito
      const cartItem = await cartModel.addItemToCart(cart.id_carrito, productId, quantity);
      
      // Obtener el resumen actualizado del carrito
      const cartSummary = await cartModel.getCartSummary(cart.id_carrito);
      
      res.status(200).json({
        success: true,
        message: 'Product added to cart successfully',
        data: {
          cart,
          item: cartItem,
          summary: cartSummary
        }
      });
    } catch (error) {
      console.error('Error adding product to cart:', error);
      
      let statusCode = 500;
      if (error.message === 'Producto no encontrado') {
        statusCode = 404;
      } else if (error.message === 'No hay suficiente stock disponible') {
        statusCode = 400;
      }
      
      res.status(statusCode).json({
        success: false,
        error: 'Error adding product to cart',
        details: error.message
      });
    }
  }

  // Actualizar la cantidad de un producto en el carrito
  async updateCartItemQuantity(req, res) {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;
      
      if (!quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Quantity must be greater than 0'
        });
      }
      
      // Actualizar la cantidad del item en el carrito
      const updatedItem = await cartModel.updateCartItemQuantity(itemId, quantity);
      
      // Obtener el resumen actualizado del carrito
      const cartSummary = await cartModel.getCartSummary(updatedItem.id_carrito);
      
      res.status(200).json({
        success: true,
        message: 'Cart item quantity updated successfully',
        data: {
          item: updatedItem,
          summary: cartSummary
        }
      });
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      
      let statusCode = 500;
      if (error.message === 'Item de carrito no encontrado') {
        statusCode = 404;
      } else if (error.message === 'No hay suficiente stock disponible') {
        statusCode = 400;
      }
      
      res.status(statusCode).json({
        success: false,
        error: 'Error updating cart item quantity',
        details: error.message
      });
    }
  }

  // Eliminar un producto del carrito
  async removeFromCart(req, res) {
    try {
      const { itemId } = req.params;
      
      // Eliminar el item del carrito
      await cartModel.removeCartItem(itemId);
      
      res.status(200).json({
        success: true,
        message: 'Product removed from cart successfully'
      });
    } catch (error) {
      console.error('Error removing product from cart:', error);
      
      let statusCode = 500;
      if (error.message === 'Item de carrito no encontrado') {
        statusCode = 404;
      }
      
      res.status(statusCode).json({
        success: false,
        error: 'Error removing product from cart',
        details: error.message
      });
    }
  }

  // Vaciar el carrito
  async clearCart(req, res) {
    try {
      const userId = req.user.id;
      
      // Obtener el carrito activo del usuario
      const cart = await cartModel.getUserActiveCart(userId);
      
      // Vaciar el carrito
      await cartModel.clearCart(cart.id_carrito);
      
      res.status(200).json({
        success: true,
        message: 'Cart cleared successfully'
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({
        success: false,
        error: 'Error clearing cart',
        details: error.message
      });
    }
  }
}

export default new CartController();
