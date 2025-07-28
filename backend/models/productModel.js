import { pool } from '../db/config.js';

class ProductModel {
  // Get all products
  async getAllProducts() {
    try {
      const query = `
        SELECT 
          p.id_producto, 
          p.nombre, 
          p.descripcion, 
          p.existencia, 
          p.precio, 
          p.estado, 
          p.id_usuario,
          p.fecha_publicacion,
          u.nombre as nombre_usuario,
          u.p_apellido as apellido_usuario,
          COALESCE(
            (SELECT i.url_imagen FROM imagenes_productos i 
             WHERE i.id_producto = p.id_producto 
             ORDER BY i.id_imagen LIMIT 1), 
            NULL
          ) as imagen_principal,
          COALESCE(
            (SELECT i.nombre_optimizado FROM imagenes_productos i 
             WHERE i.id_producto = p.id_producto 
             ORDER BY i.id_imagen LIMIT 1), 
            NULL
          ) as imagen_optimizada,
          COALESCE(
            (SELECT i.nombre_miniatura FROM imagenes_productos i 
             WHERE i.id_producto = p.id_producto 
             ORDER BY i.id_imagen LIMIT 1), 
            NULL
          ) as imagen_miniatura
        FROM 
          productos p
        LEFT JOIN 
          usuarios u ON p.id_usuario = u.id_usuario
        ORDER BY 
          p.fecha_publicacion DESC
      `;
      
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  }

  // Get product by ID
  async getProductById(productId) {
    try {
      const query = `
        SELECT 
          p.id_producto, 
          p.nombre, 
          p.descripcion, 
          p.existencia, 
          p.precio, 
          p.estado, 
          p.id_usuario,
          p.fecha_publicacion,
          u.nombre as nombre_usuario,
          u.p_apellido as apellido_usuario,
          u.correo as correo_usuario
        FROM 
          productos p
        LEFT JOIN 
          usuarios u ON p.id_usuario = u.id_usuario
        WHERE 
          p.id_producto = $1
      `;
      
      const result = await pool.query(query, [productId]);
      
      if (result.rows.length === 0) {
        throw new Error('Producto no encontrado');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error getting product ${productId}:`, error);
      throw error;
    }
  }

  // Get product images
  async getProductImages(productId) {
    try {
      const query = `
        SELECT 
          id_imagen, 
          id_producto, 
          url_imagen, 
          nombre_archivo, 
          nombre_optimizado, 
          nombre_miniatura
        FROM imagenes_productos
        WHERE id_producto = $1
        ORDER BY id_imagen
      `;
      
      const result = await pool.query(query, [productId]);
      return result.rows;
    } catch (error) {
      console.error(`Error getting product images for product ${productId}:`, error);
      throw error;
    }
  }

  // Create product
  async createProduct(productData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { nombre, descripcion, existencia, precio, estado, id_usuario } = productData;
      
      const insertQuery = `
        INSERT INTO productos 
          (nombre, descripcion, existencia, precio, estado, id_usuario)
        VALUES 
          ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const result = await client.query(insertQuery, [
        nombre,
        descripcion,
        existencia,
        precio,
        estado,
        id_usuario
      ]);
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating product:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Update product
  async updateProduct(productId, updateData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // First, check if product exists
      const checkQuery = 'SELECT * FROM productos WHERE id_producto = $1';
      const checkResult = await client.query(checkQuery, [productId]);
      
      if (checkResult.rows.length === 0) {
        throw new Error('Producto no encontrado');
      }
      
      // Build update query dynamically based on provided fields
      const fields = [];
      const values = [];
      let paramCount = 1;
      
      for (const [key, value] of Object.entries(updateData)) {
        if (value !== undefined) {
          fields.push(`${key} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      }
      
      if (fields.length === 0) {
        // No fields to update
        await client.query('COMMIT');
        return checkResult.rows[0];
      }
      
      values.push(productId); // Add productId as the last parameter
      
      const updateQuery = `
        UPDATE productos 
        SET ${fields.join(', ')} 
        WHERE id_producto = $${paramCount}
        RETURNING *
      `;
      
      const result = await client.query(updateQuery, values);
      
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error updating product ${productId}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete product
  async deleteProduct(productId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // First, delete any associated images
      await client.query('DELETE FROM imagenes_productos WHERE id_producto = $1', [productId]);
      
      // Then, delete the product
      const result = await client.query('DELETE FROM productos WHERE id_producto = $1 RETURNING *', [productId]);
      
      if (result.rowCount === 0) {
        throw new Error('Producto no encontrado');
      }
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Error deleting product ${productId}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Add product image
  async addProductImage(imageData) {
    try {
      const { id_producto, url_imagen, nombre_archivo, nombre_optimizado, nombre_miniatura } = imageData;
      
      const query = `
        INSERT INTO imagenes_productos 
          (id_producto, url_imagen, nombre_archivo, nombre_optimizado, nombre_miniatura)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        id_producto, 
        url_imagen, 
        nombre_archivo || null, 
        nombre_optimizado || null, 
        nombre_miniatura || null
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error adding product image:', error);
      throw error;
    }
  }

  // Delete product image
  async deleteProductImage(imageId) {
    try {
      const result = await pool.query('DELETE FROM imagenes_productos WHERE id_imagen = $1 RETURNING *', [imageId]);
      
      if (result.rowCount === 0) {
        throw new Error('Imagen no encontrada');
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting product image ${imageId}:`, error);
      throw error;
    }
  }

  // Get products by user ID (for vendor's products)
  async getProductsByUserId(userId) {
    try {
      const query = `
        SELECT 
          p.id_producto, 
          p.nombre, 
          p.descripcion, 
          p.existencia, 
          p.precio, 
          p.estado, 
          p.id_usuario,
          p.fecha_publicacion,
          u.nombre as nombre_usuario,
          u.p_apellido as apellido_usuario,
          COALESCE(
            (SELECT i.url_imagen FROM imagenes_productos i 
             WHERE i.id_producto = p.id_producto 
             ORDER BY i.id_imagen LIMIT 1), 
            NULL
          ) as imagen_principal,
          COALESCE(
            (SELECT i.nombre_optimizado FROM imagenes_productos i 
             WHERE i.id_producto = p.id_producto 
             ORDER BY i.id_imagen LIMIT 1), 
            NULL
          ) as imagen_optimizada,
          COALESCE(
            (SELECT i.nombre_miniatura FROM imagenes_productos i 
             WHERE i.id_producto = p.id_producto 
             ORDER BY i.id_imagen LIMIT 1), 
            NULL
          ) as imagen_miniatura
        FROM 
          productos p
        LEFT JOIN 
          usuarios u ON p.id_usuario = u.id_usuario
        WHERE 
          p.id_usuario = $1
        ORDER BY 
          p.fecha_publicacion DESC
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting products by user ID:', error);
      throw error;
    }
  }
}

export default new ProductModel();
