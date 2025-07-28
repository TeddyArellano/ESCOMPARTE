import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

// Register route
router.post('/register', authController.register);

// Login route
router.post('/login', authController.login);

// Test protected route
router.get('/me', authController.verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
    message: 'Token válido'
  });
});

export default router;
