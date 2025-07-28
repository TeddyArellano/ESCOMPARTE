import userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';

class UserController {
  // Get details for the authenticated user
  async getUserDetails(req, res) {
    try {
      console.log('Received request for user details with user:', req.user);
      
      if (!req.user || !req.user.id) {
        console.error('Missing user ID in token payload');
        return res.status(401).json({
          success: false,
          message: 'No se pudo identificar al usuario, por favor inicie sesión nuevamente'
        });
      }
      
      // Use the correct field name based on your JWT payload
      const userId = req.user.id || req.user.id_usuario;
      console.log('Looking up user with ID:', userId);
      
      // Get user details from model
      const userDetails = await userModel.getUserById(userId);
      console.log('User details retrieved:', userDetails ? 'Found' : 'Not found');
      
      if (!userDetails) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      // Remove password from the response
      if (userDetails.contrasena) {
        delete userDetails.contrasena;
      }
      
      console.log('Returning user details:', { ...userDetails, contrasena: '[REMOVED]' });
      return res.status(200).json({
        success: true,
        user: userDetails
      });
    } catch (error) {
      console.error('Error getting user details:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener detalles del usuario',
        error: error.message
      });
    }
  }

  // Update user profile
  async updateUserProfile(req, res) {
    try {
      const userId = req.user.id_usuario;
      const { 
        nombre, 
        p_apellido, 
        s_apellido, 
        correo,
        telefono,
        currentPassword,
        newPassword
      } = req.body;
      
      // Validate email if provided
      if (correo && correo !== req.user.correo) {
        const emailExists = await userModel.emailExists(correo);
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'El correo electrónico ya está registrado por otro usuario'
          });
        }
      }
      
      // Check current password if trying to update password
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({
            success: false,
            message: 'Debe proporcionar su contraseña actual para cambiarla'
          });
        }
        
        const passwordMatch = await userModel.verifyPassword(userId, currentPassword);
        if (!passwordMatch) {
          return res.status(401).json({
            success: false,
            message: 'La contraseña actual es incorrecta'
          });
        }
      }
      
      // Update user
      const updatedUser = await userModel.updateUser(userId, {
        nombre,
        p_apellido,
        s_apellido,
        correo,
        telefono,
        newPassword
      });
      
      // Remove password from the response
      delete updatedUser.contrasena;
      
      return res.status(200).json({
        success: true,
        message: 'Perfil actualizado correctamente',
        user: updatedUser
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar el perfil',
        error: error.message
      });
    }
  }

  // Get order history for a user
  async getOrderHistory(req, res) {
    try {
      const userId = req.user.id_usuario;
      
      // Get order history from model
      const orders = await userModel.getOrderHistory(userId);
      
      return res.status(200).json({
        success: true,
        orders
      });
    } catch (error) {
      console.error('Error getting order history:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener historial de pedidos',
        error: error.message
      });
    }
  }

  // Get details for a specific order
  async getOrderDetails(req, res) {
    try {
      const userId = req.user.id_usuario;
      const orderId = req.params.orderId;
      
      // Get order details from model
      const order = await userModel.getOrderDetails(userId, orderId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Pedido no encontrado'
        });
      }
      
      return res.status(200).json({
        success: true,
        order
      });
    } catch (error) {
      console.error('Error getting order details:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener detalles del pedido',
        error: error.message
      });
    }
  }

  // Update user role (admin only)
  async updateUserRole(req, res) {
    try {
      // This endpoint should be protected by admin middleware
      const { userId, role } = req.body;
      
      if (!userId || !role) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario y rol son requeridos'
        });
      }
      
      if (!['usuario', 'vendedor'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Rol inválido. Debe ser "usuario" o "vendedor"'
        });
      }
      
      const updatedUser = await userModel.updateUserRole(userId, role);
      
      return res.status(200).json({
        success: true,
        message: `Rol de usuario actualizado a ${role} exitosamente`,
        user: updatedUser
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar rol de usuario',
        error: error.message
      });
    }
  }

  // Request to become a vendor
  async requestVendorRole(req, res) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: 'No se pudo identificar al usuario, por favor inicie sesión nuevamente'
        });
      }

      const userId = req.user.id || req.user.id_usuario;
      const { reason } = req.body;

      if (!reason || reason.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Se requiere una razón para la solicitud'
        });
      }

      console.log(`User ${userId} requesting vendor role with reason: ${reason}`);

      // Check if user is already a vendor
      const userDetails = await userModel.getUserById(userId);
      if (!userDetails) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      if (userDetails.rol === 'vendedor') {
        return res.status(400).json({
          success: false,
          message: 'El usuario ya tiene rol de vendedor'
        });
      }

      // In a production environment, you'd want to:
      // 1. Store this request in a vendor_requests table
      // 2. Have an admin approve/reject it through an admin panel
      // 3. Send email notifications

      // For development purposes, we'll immediately grant the vendor role
      const updatedUser = await userModel.updateUserRole(userId, 'vendedor');

      // Log the request
      console.log(`User ${userId} role updated to vendedor`);

      return res.status(200).json({
        success: true,
        message: 'Solicitud aprobada automáticamente (entorno de desarrollo)',
        userUpdated: true,
        user: {
          id: updatedUser.id_usuario,
          rol: updatedUser.rol
        }
      });
    } catch (error) {
      console.error('Error processing vendor role request:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al procesar la solicitud',
        error: error.message
      });
    }
  }
}

export default new UserController();
