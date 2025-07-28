import express from 'express';
import userController from '../controllers/userController.js';
import authController from '../controllers/authController.js';

const router = express.Router();

// Middleware to protect routes
const protectRoute = authController.verifyToken;

// Get current user details
router.get('/me', protectRoute, userController.getUserDetails);

// Update user profile
router.put('/profile', protectRoute, userController.updateUserProfile);

// Get user's order history
router.get('/orders', protectRoute, userController.getOrderHistory);

// Get specific order details
router.get('/orders/:orderId', protectRoute, userController.getOrderDetails);

// Update user role - for development/testing - should be restricted to admin
router.put('/role', protectRoute, userController.updateUserRole);

// Request vendor role
router.post('/role/request', protectRoute, userController.requestVendorRole);

export default router;
