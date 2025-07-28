import { pool } from '../db/config.js';
import bcrypt from 'bcrypt';

class UserModel {
  // Create a new user
  async createUser(userData) {
    const { 
      nombre, 
      apellidos, 
      email, 
      password, 
      escuela, 
      carrera, 
      semestre = null 
    } = userData;
    
    // Split apellidos into p_apellido and s_apellido
    const apellidosArray = apellidos.split(' ');
    const p_apellido = apellidosArray[0] || '';
    const s_apellido = apellidosArray.slice(1).join(' ') || '';
    
    // Generate username from email
    const username = email.split('@')[0];
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    const client = await pool.connect();
    
    try {
      // Begin transaction
      await client.query('BEGIN');
      
      // First, insert basic user data (default role is 'usuario')
      const userInsertQuery = `
        INSERT INTO usuarios (username, contrasena, nombre, p_apellido, s_apellido, correo, telefono, rol)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id_usuario, username, nombre, p_apellido, s_apellido, correo, rol, fecha_registro
      `;
      
      const userResult = await client.query(userInsertQuery, [
        username,
        hashedPassword,
        nombre,
        p_apellido,
        s_apellido,
        email,
        null, // telefono is optional
        userData.rol || 'usuario' // Default role is 'usuario' if not specified
      ]);
      
      const user = userResult.rows[0];
      const userId = user.id_usuario;
      
      // Then, insert academic info into a separate table
      // Note: We need to create this table first
      await client.query(`
        CREATE TABLE IF NOT EXISTS info_academica (
          id_info_academica SERIAL PRIMARY KEY,
          id_usuario INTEGER NOT NULL,
          escuela VARCHAR(255) NOT NULL,
          carrera VARCHAR(255) NOT NULL,
          semestre VARCHAR(50),
          FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        )
      `);
      
      const academicInsertQuery = `
        INSERT INTO info_academica (id_usuario, escuela, carrera, semestre)
        VALUES ($1, $2, $3, $4)
      `;
      
      await client.query(academicInsertQuery, [
        userId,
        escuela,
        carrera,
        semestre
      ]);
      
      // Commit transaction
      await client.query('COMMIT');
      
      // Return user data
      return {
        id: userId,
        username: user.username,
        nombre: user.nombre,
        apellidos: user.p_apellido + ' ' + user.s_apellido,
        email: user.correo,
        fecha_registro: user.fecha_registro
      };
      
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Get user by email
  async getUserByEmail(email) {
    const query = `
      SELECT u.id_usuario, u.username, u.contrasena, u.nombre, u.p_apellido, u.s_apellido, 
             u.correo, u.telefono, u.rol, u.fecha_registro, ia.escuela, ia.carrera, ia.semestre
      FROM usuarios u
      LEFT JOIN info_academica ia ON u.id_usuario = ia.id_usuario
      WHERE u.correo = $1
    `;
    
    const result = await pool.query(query, [email]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const userData = result.rows[0];
    return {
      id: userData.id_usuario,
      username: userData.username,
      nombre: userData.nombre,
      apellidos: `${userData.p_apellido} ${userData.s_apellido}`.trim(),
      email: userData.correo,
      password: userData.contrasena,  // This is the hashed password
      telefono: userData.telefono,
      rol: userData.rol || 'usuario',  // Include the role
      escuela: userData.escuela,
      carrera: userData.carrera,
      semestre: userData.semestre,
      fecha_registro: userData.fecha_registro
    };
  }
  
  // Validate user credentials
  async validateCredentials(email, password) {
    const user = await this.getUserByEmail(email);
    
    if (!user) {
      return null;
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return null;
    }
    
    // Remove password from the returned user object
    const { password: _, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  }
  
  // Check if email already exists
  async emailExists(email) {
    const query = `SELECT COUNT(*) as count FROM usuarios WHERE correo = $1`;
    const result = await pool.query(query, [email]);
    
    return result.rows[0].count > 0;
  }
  
  // Get user by ID
  async getUserById(userId) {
    const query = `
      SELECT u.id_usuario, u.username, u.nombre, u.p_apellido, u.s_apellido, 
             u.correo, u.telefono, u.rol, u.fecha_registro, ia.escuela, ia.carrera, ia.semestre
      FROM usuarios u
      LEFT JOIN info_academica ia ON u.id_usuario = ia.id_usuario
      WHERE u.id_usuario = $1
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  }
  
  // Update user profile
  async updateUser(userId, userData) {
    const { 
      nombre, 
      p_apellido, 
      s_apellido, 
      correo, 
      telefono,
      newPassword 
    } = userData;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // First update basic user info
      let updateQuery = `
        UPDATE usuarios 
        SET nombre = COALESCE($1, nombre),
            p_apellido = COALESCE($2, p_apellido),
            s_apellido = COALESCE($3, s_apellido),
            correo = COALESCE($4, correo),
            telefono = COALESCE($5, telefono)
      `;
      
      const params = [
        nombre, 
        p_apellido, 
        s_apellido, 
        correo, 
        telefono
      ];
      
      // Add password update if provided
      if (newPassword) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        updateQuery += `, contrasena = $6`;
        params.push(hashedPassword);
      }
      
      updateQuery += ` WHERE id_usuario = $${params.length + 1} RETURNING *`;
      params.push(userId);
      
      const updateResult = await client.query(updateQuery, params);
      
      // Commit transaction
      await client.query('COMMIT');
      
      return updateResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Verify user password
  async verifyPassword(userId, password) {
    const query = `SELECT contrasena FROM usuarios WHERE id_usuario = $1`;
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return false;
    }
    
    const hashedPassword = result.rows[0].contrasena;
    return await bcrypt.compare(password, hashedPassword);
  }
  
  // Get order history for a user
  async getOrderHistory(userId) {
    const query = `
      SELECT c.id_carrito, c.fecha_creacion, c.estado,
             COALESCE(SUM(ic.cantidad * ic.precio_unitario), 0) as total,
             COUNT(ic.id_item_carrito) as item_count
      FROM carritos c
      LEFT JOIN items_carrito ic ON c.id_carrito = ic.id_carrito
      WHERE c.id_usuario = $1
      GROUP BY c.id_carrito, c.fecha_creacion, c.estado
      ORDER BY c.fecha_creacion DESC
    `;
    
    const ordersResult = await pool.query(query, [userId]);
    const orders = ordersResult.rows;
    
    // For each order, get the items
    for (let order of orders) {
      const itemsQuery = `
        SELECT ic.id_item_carrito, ic.id_producto, ic.cantidad, ic.precio_unitario,
               p.nombre, p.estado,
               COALESCE((SELECT url_imagen FROM imagenes_productos WHERE id_producto = p.id_producto LIMIT 1), NULL) as imagen_principal
        FROM items_carrito ic
        JOIN productos p ON ic.id_producto = p.id_producto
        WHERE ic.id_carrito = $1
      `;
      
      const itemsResult = await pool.query(itemsQuery, [order.id_carrito]);
      order.items = itemsResult.rows;
    }
    
    return orders;
  }
  
  // Get details for a specific order
  async getOrderDetails(userId, orderId) {
    // First check if the order belongs to this user
    const orderQuery = `
      SELECT c.id_carrito, c.fecha_creacion, c.estado
      FROM carritos c
      WHERE c.id_carrito = $1 AND c.id_usuario = $2
    `;
    
    const orderResult = await pool.query(orderQuery, [orderId, userId]);
    
    if (orderResult.rows.length === 0) {
      return null;
    }
    
    const order = orderResult.rows[0];
    
    // Get items for this order
    const itemsQuery = `
      SELECT ic.id_item_carrito, ic.id_producto, ic.cantidad, ic.precio_unitario, ic.fecha_agregado,
             p.nombre, p.descripcion, p.estado,
             COALESCE((SELECT url_imagen FROM imagenes_productos WHERE id_producto = p.id_producto LIMIT 1), NULL) as imagen_principal
      FROM items_carrito ic
      JOIN productos p ON ic.id_producto = p.id_producto
      WHERE ic.id_carrito = $1
    `;
    
    const itemsResult = await pool.query(itemsQuery, [orderId]);
    order.items = itemsResult.rows;
    
    // Calculate total
    order.total = order.items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
    
    return order;
  }
  
  // Update user role
  async updateUserRole(userId, role) {
    if (!['usuario', 'vendedor'].includes(role)) {
      throw new Error('Invalid role. Must be "usuario" or "vendedor"');
    }
    
    const query = `
      UPDATE usuarios
      SET rol = $1
      WHERE id_usuario = $2
      RETURNING id_usuario, username, nombre, p_apellido, s_apellido, correo, rol
    `;
    
    const result = await pool.query(query, [role, userId]);
    
    if (result.rows.length === 0) {
      throw new Error('User not found');
    }
    
    return result.rows[0];
  }
}

export default new UserModel();
