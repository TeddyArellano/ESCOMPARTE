import { pool } from '../db/config.js';

class CartModel {
  // Obtener el carrito activo de un usuario
  async getUserActiveCart(userId) {
    try {
      // Primero verificamos si el usuario tiene un carrito activo
      const cartQuery = `
        SELECT id_carrito, id_usuario, fecha_creacion, estado
        FROM carritos
        WHERE id_usuario = $1 AND estado = 'activo'
        ORDER BY fecha_creacion DESC
        LIMIT 1
      `;
      
      const cartResult = await pool.query(cartQuery, [userId]);
      
      // Si no tiene carrito activo, crear uno nuevo
      if (cartResult.rows.length === 0) {
        const newCartQuery = `
          INSERT INTO carritos (id_usuario, estado)
          VALUES ($1, 'activo')
          RETURNING id_carrito, id_usuario, fecha_creacion, estado
        `;
        
        const newCartResult = await pool.query(newCartQuery, [userId]);
        return newCartResult.rows[0];
      }
      
      return cartResult.rows[0];
    } catch (error) {
      console.error('Error getting or creating active cart:', error);
      throw error;
    }
  }

  // Obtener los items del carrito
  async getCartItems(cartId) {
    try {
      const query = `
        SELECT 
          ic.id_item_carrito, 
          ic.id_carrito, 
          ic.id_producto, 
          ic.cantidad, 
          ic.precio_unitario,
          ic.fecha_agregado,
          p.nombre,
          p.descripcion,
          p.existencia,
          p.estado,
          COALESCE(
            (SELECT i.url_imagen FROM imagenes_productos i 
             WHERE i.id_producto = p.id_producto 
             ORDER BY i.id_imagen LIMIT 1), 
            NULL
          ) as imagen_principal,
          COALESCE(
            (SELECT i.nombre_archivo FROM imagenes_productos i 
             WHERE i.id_producto = p.id_producto 
             ORDER BY i.id_imagen LIMIT 1), 
            NULL
          ) as nombre_archivo,
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
          items_carrito ic
        JOIN 
          productos p ON ic.id_producto = p.id_producto
        WHERE 
          ic.id_carrito = $1
        ORDER BY 
          ic.fecha_agregado DESC
      `;
      
      const result = await pool.query(query, [cartId]);
      return result.rows;
    } catch (error) {
      console.error('Error getting cart items:', error);
      throw error;
    }
  }

  // Añadir un producto al carrito
  async addItemToCart(cartId, productId, quantity) {
    const client = await pool.connect();
    
    try {
      // Begin transaction
      await client.query('BEGIN');
      
      // Check product existence and price
      const productQuery = `
        SELECT id_producto, precio, existencia
        FROM productos
        WHERE id_producto = $1
      `;
      
      const productResult = await client.query(productQuery, [productId]);
      
      if (productResult.rows.length === 0) {
        throw new Error('Producto no encontrado');
      }
      
      const product = productResult.rows[0];
      
      // Check stock availability
      if (product.existencia < quantity) {
        throw new Error('No hay suficiente stock disponible');
      }
      
      // Check if the product is already in the cart
      const checkQuery = `
        SELECT id_item_carrito, cantidad
        FROM items_carrito
        WHERE id_carrito = $1 AND id_producto = $2
      `;
      
      const checkResult = await client.query(checkQuery, [cartId, productId]);
      
      let itemId;
      
      if (checkResult.rows.length > 0) {
        // Update existing cart item
        const existingItem = checkResult.rows[0];
        const newQuantity = existingItem.cantidad + quantity;
        
        // Check again if there's enough stock
        if (product.existencia < newQuantity) {
          throw new Error('No hay suficiente stock disponible');
        }
        
        const updateQuery = `
          UPDATE items_carrito
          SET cantidad = $1, precio_unitario = $2
          WHERE id_item_carrito = $3
          RETURNING id_item_carrito
        `;
        
        const updateResult = await client.query(updateQuery, [
          newQuantity,
          product.precio,
          existingItem.id_item_carrito
        ]);
        
        itemId = updateResult.rows[0].id_item_carrito;
      } else {
        // Insert new cart item
        const insertQuery = `
          INSERT INTO items_carrito (id_carrito, id_producto, cantidad, precio_unitario)
          VALUES ($1, $2, $3, $4)
          RETURNING id_item_carrito
        `;
        
        const insertResult = await client.query(insertQuery, [
          cartId,
          productId,
          quantity,
          product.precio
        ]);
        
        itemId = insertResult.rows[0].id_item_carrito;
      }
      
      // Commit transaction
      await client.query('COMMIT');
      
      return {
        id_item_carrito: itemId,
        id_carrito: cartId,
        id_producto: productId,
        cantidad: quantity,
        precio_unitario: product.precio
      };
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      console.error('Error adding item to cart:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Actualizar la cantidad de un producto en el carrito
  async updateCartItemQuantity(itemId, quantity) {
    const client = await pool.connect();
    
    try {
      // Begin transaction
      await client.query('BEGIN');
      
      // Get the cart item and related product
      const itemQuery = `
        SELECT ic.id_carrito, ic.id_producto, p.existencia, p.precio
        FROM items_carrito ic
        JOIN productos p ON ic.id_producto = p.id_producto
        WHERE ic.id_item_carrito = $1
      `;
      
      const itemResult = await client.query(itemQuery, [itemId]);
      
      if (itemResult.rows.length === 0) {
        throw new Error('Item de carrito no encontrado');
      }
      
      const item = itemResult.rows[0];
      
      // Check stock availability
      if (item.existencia < quantity) {
        throw new Error('No hay suficiente stock disponible');
      }
      
      // Update cart item quantity
      const updateQuery = `
        UPDATE items_carrito
        SET cantidad = $1
        WHERE id_item_carrito = $2
        RETURNING id_item_carrito, id_carrito, id_producto, cantidad, precio_unitario
      `;
      
      const updateResult = await client.query(updateQuery, [quantity, itemId]);
      
      // Commit transaction
      await client.query('COMMIT');
      
      return updateResult.rows[0];
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      console.error('Error updating cart item quantity:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Eliminar un producto del carrito
  async removeCartItem(itemId) {
    try {
      const query = `
        DELETE FROM items_carrito
        WHERE id_item_carrito = $1
        RETURNING id_item_carrito
      `;
      
      const result = await pool.query(query, [itemId]);
      
      if (result.rowCount === 0) {
        throw new Error('Item de carrito no encontrado');
      }
      
      return true;
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  }

  // Vaciar el carrito
  async clearCart(cartId) {
    try {
      const query = `
        DELETE FROM items_carrito
        WHERE id_carrito = $1
      `;
      
      await pool.query(query, [cartId]);
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  // Obtener el resumen del carrito (cantidad de items y total)
  async getCartSummary(cartId) {
    try {
      const query = `
        SELECT 
          COUNT(id_item_carrito) as items_count,
          SUM(cantidad) as total_quantity,
          SUM(cantidad * precio_unitario) as total_amount
        FROM 
          items_carrito
        WHERE 
          id_carrito = $1
      `;
      
      const result = await pool.query(query, [cartId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting cart summary:', error);
      throw error;
    }
  }
}

export default new CartModel();
