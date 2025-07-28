import express from 'express';
import cartController from '../controllers/cartController.js';
import authController from '../controllers/authController.js';

const router = express.Router();

// Todas las rutas de carrito requieren autenticación
router.use(authController.verifyToken);

// Obtener el carrito del usuario
router.get('/', cartController.getCart);

// Añadir un producto al carrito
router.post('/add', cartController.addToCart);

// Actualizar la cantidad de un producto en el carrito
router.put('/items/:itemId', cartController.updateCartItemQuantity);

// Eliminar un producto del carrito
router.delete('/items/:itemId', cartController.removeFromCart);

// Vaciar el carrito
router.delete('/clear', cartController.clearCart);

export default router;
