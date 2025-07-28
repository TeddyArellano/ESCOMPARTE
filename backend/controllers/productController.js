import productModel from '../models/productModel.js';
import { upload, processImage, deleteImageFiles } from '../utils/fileUpload.js';

class ProductController {
  // Get all products
  async getAllProducts(req, res) {
    try {
      const products = await productModel.getAllProducts();
      
      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Error getting products:', error);
      res.status(500).json({
        success: false,
        error: 'Error retrieving products',
        details: error.message
      });
    }
  }

  // Get product by ID
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      
      // Validate ID is a number
      if (isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: 'Product ID must be a number'
        });
      }
      
      const product = await productModel.getProductById(id);
      
      // Get product images
      const images = await productModel.getProductImages(id);
      
      res.status(200).json({
        success: true,
        data: {
          ...product,
          images
        }
      });
    } catch (error) {
      console.error(`Error getting product ${req.params.id}:`, error);
      
      if (error.message === 'Producto no encontrado') {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error retrieving product',
        details: error.message
      });
    }
  }

  // Create product
  async createProduct(req, res) {
    try {
      const { nombre, descripcion, existencia, precio, estado = 'usado' } = req.body;
      
      // Basic validation
      if (!nombre) {
        return res.status(400).json({
          success: false,
          error: 'Product name is required'
        });
      }
      
      // Get user ID from JWT token (set by middleware)
      const id_usuario = req.user.id;
      
      const productData = {
        nombre,
        descripcion: descripcion || null,
        existencia: existencia || 1,
        precio: precio || 0,
        estado,
        id_usuario
      };
      
      const newProduct = await productModel.createProduct(productData);
      
      // Si hay un archivo adjunto, añadirlo como imagen principal
      if (req.file) {
        const { filename, path: filePath } = req.file;
        
        // Procesar la imagen para crear versiones optimizadas
        const { optimized, thumbnail } = await processImage(filePath, filename);
        
        // Construir las URLs para las imágenes
        const baseUrl = `${req.protocol}://${req.get('host')}/uploads/productos/`;
        const url_imagen = `${baseUrl}${filename}`;
        
        const imageData = {
          id_producto: newProduct.id_producto,
          url_imagen,
          nombre_archivo: filename,
          nombre_optimizado: optimized,
          nombre_miniatura: thumbnail
        };
        
        await productModel.addProductImage(imageData);
        
        // Actualizar el objeto de producto con la información de la imagen
        newProduct.imagen_principal = url_imagen;
        newProduct.imagen_optimizada = `${baseUrl}${optimized}`;
        newProduct.imagen_miniatura = `${baseUrl}${thumbnail}`;
      }
      
      res.status(201).json({
        success: true,
        data: newProduct,
        message: 'Product created successfully'
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        success: false,
        error: 'Error creating product',
        details: error.message
      });
    }
  }

  // Update product
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, existencia, precio, estado } = req.body;
      
      // Validate ID is a number
      if (isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: 'Product ID must be a number'
        });
      }
      
      // Check if product belongs to user
      const product = await productModel.getProductById(id);
      
      if (product.id_usuario !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'You are not authorized to update this product'
        });
      }
      
      const updateData = {};
      
      if (nombre !== undefined) updateData.nombre = nombre;
      if (descripcion !== undefined) updateData.descripcion = descripcion;
      if (existencia !== undefined) updateData.existencia = existencia;
      if (precio !== undefined) updateData.precio = precio;
      if (estado !== undefined) updateData.estado = estado;
      
      const updatedProduct = await productModel.updateProduct(id, updateData);
      
      res.status(200).json({
        success: true,
        data: updatedProduct,
        message: 'Product updated successfully'
      });
    } catch (error) {
      console.error(`Error updating product ${req.params.id}:`, error);
      
      if (error.message === 'Producto no encontrado') {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error updating product',
        details: error.message
      });
    }
  }

  // Delete product
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      
      // Validate ID is a number
      if (isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: 'Product ID must be a number'
        });
      }
      
      // Check if product belongs to user
      const product = await productModel.getProductById(id);
      
      if (product.id_usuario !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'You are not authorized to delete this product'
        });
      }
      
      await productModel.deleteProduct(id);
      
      res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      console.error(`Error deleting product ${req.params.id}:`, error);
      
      if (error.message === 'Producto no encontrado') {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error deleting product',
        details: error.message
      });
    }
  }

  // Add product image
  async addProductImage(req, res) {
    try {
      const { id } = req.params;
      
      // Validate ID is a number
      if (isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          error: 'Product ID must be a number'
        });
      }
      
      // Check if product exists
      const product = await productModel.getProductById(id);
      
      // Check if product belongs to the authenticated user
      if (product.id_usuario !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'You are not authorized to add images to this product'
        });
      }
      
      // Si no hay archivo en la solicitud
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No se ha proporcionado ninguna imagen'
        });
      }
      
      const { filename, path: filePath } = req.file;
      
      // Procesar la imagen para crear versiones optimizadas
      const { optimized, thumbnail } = await processImage(filePath, filename);
      
      // Construir las URLs para las imágenes
      const baseUrl = `${req.protocol}://${req.get('host')}/uploads/productos/`;
      const url_imagen = `${baseUrl}${filename}`;
      
      const imageData = {
        id_producto: parseInt(id),
        url_imagen,
        nombre_archivo: filename,
        nombre_optimizado: optimized,
        nombre_miniatura: thumbnail
      };
      
      const newImage = await productModel.addProductImage(imageData);
      
      res.status(201).json({
        success: true,
        data: {
          ...newImage,
          urls: {
            original: `${baseUrl}${filename}`,
            optimized: `${baseUrl}${optimized}`,
            thumbnail: `${baseUrl}${thumbnail}`
          }
        },
        message: 'Image added successfully'
      });
    } catch (error) {
      console.error(`Error adding image for product ${req.params.id}:`, error);
      
      if (error.message === 'Producto no encontrado') {
        return res.status(404).json({
          success: false,
          error: 'Product not found'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error adding image',
        details: error.message
      });
    }
  }

  // Delete product image
  async deleteProductImage(req, res) {
    try {
      const { imageId } = req.params;
      
      // Validate ID is a number
      if (isNaN(parseInt(imageId))) {
        return res.status(400).json({
          success: false,
          error: 'Image ID must be a number'
        });
      }
      
      // Obtener información de la imagen antes de eliminarla
      const query = 'SELECT * FROM imagenes_productos WHERE id_imagen = $1';
      const result = await pool.query(query, [imageId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Imagen no encontrada'
        });
      }
      
      const imageInfo = result.rows[0];
      
      // Verificar que el producto pertenezca al usuario
      const product = await productModel.getProductById(imageInfo.id_producto);
      
      if (product.id_usuario !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'No tiene permiso para eliminar esta imagen'
        });
      }
      
      // Eliminar el registro de la base de datos
      await productModel.deleteProductImage(imageId);
      
      // Si hay un nombre de archivo, eliminar los archivos físicos
      if (imageInfo.nombre_archivo) {
        await deleteImageFiles(imageInfo.nombre_archivo);
      }
      
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });
    } catch (error) {
      console.error(`Error deleting image ${req.params.imageId}:`, error);
      
      if (error.message === 'Imagen no encontrada') {
        return res.status(404).json({
          success: false,
          error: 'Image not found'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Error deleting image',
        details: error.message
      });
    }
  }

  // Get products for the authenticated vendor
  async getVendorProducts(req, res) {
    try {
      const vendorId = req.user.id || req.user.id_usuario;
      
      if (!vendorId) {
        return res.status(400).json({
          success: false,
          error: 'ID de vendedor no encontrado'
        });
      }
      
      console.log(`Getting products for vendor ID: ${vendorId}`);
      
      const products = await productModel.getProductsByUserId(vendorId);
      
      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Error getting vendor products:', error);
      res.status(500).json({
        success: false,
        error: 'Error retrieving vendor products',
        details: error.message
      });
    }
  }
}

export default new ProductController();
