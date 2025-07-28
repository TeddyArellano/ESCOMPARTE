import express from 'express';
import productController from '../controllers/productController.js';
import authController from '../controllers/authController.js';
import { upload } from '../utils/fileUpload.js';

const router = express.Router();

// Public routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected routes (require vendor role)
router.post('/', 
  authController.verifyToken, 
  authController.verifyVendorRole, 
  upload.single('imagen'), // Middleware para manejar la carga de imágenes
  productController.createProduct
);

router.put('/:id', 
  authController.verifyToken, 
  authController.verifyVendorRole, 
  upload.single('imagen'), // Opcional: para actualizar la imagen al actualizar el producto
  productController.updateProduct
);

router.delete('/:id', 
  authController.verifyToken, 
  authController.verifyVendorRole, 
  productController.deleteProduct
);

// Get vendor's own products
// Nota: esta ruta debe estar después de la ruta con parámetro :id para evitar conflictos
router.get('/mis-productos', 
  authController.verifyToken, 
  authController.verifyVendorRole, 
  productController.getVendorProducts
);

// Image routes
router.post('/:id/images', 
  authController.verifyToken, 
  authController.verifyVendorRole, 
  upload.single('imagen'), // Middleware para manejar la carga de imágenes
  productController.addProductImage
);

router.delete('/images/:imageId', 
  authController.verifyToken, 
  authController.verifyVendorRole, 
  productController.deleteProductImage
);

export default router;
