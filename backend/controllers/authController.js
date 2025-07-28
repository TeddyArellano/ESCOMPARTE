import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

// Secret for signing JWTs
const JWT_SECRET = process.env.JWT_SECRET || 'escomparte_jwt_secret_key';

class AuthController {
  // Register a new user
  async register(req, res) {
    try {
      const { 
        nombre, 
        apellidos, 
        email, 
        password, 
        escuela, 
        carrera, 
        semestre 
      } = req.body;
      
      // Validate required fields
      if (!nombre || !apellidos || !email || !password || !escuela || !carrera) {
        return res.status(400).json({
          success: false,
          error: 'Todos los campos requeridos deben ser proporcionados'
        });
      }
      
      // Check if email already exists
      const emailExists = await userModel.emailExists(email);
      if (emailExists) {
        return res.status(409).json({
          success: false,
          error: 'El correo electrónico ya está registrado'
        });
      }
      
      // Create user
      const userData = await userModel.createUser({
        nombre,
        apellidos,
        email,
        password,
        escuela,
        carrera,
        semestre
      });
      
      // Generate token with both id and id_usuario to ensure compatibility
      const token = jwt.sign(
        { 
          id: userData.id, 
          id_usuario: userData.id,  // Include both formats for compatibility
          email: userData.email,
          rol: userData.rol || 'usuario'  // Include the role in the token
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Return success with user data and token
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        user: userData,
        token
      });
      
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        error: 'Error al registrar usuario',
        details: error.message
      });
    }
  }
  
  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email y contraseña son requeridos'
        });
      }
      
      // Validate credentials
      const user = await userModel.validateCredentials(email, password);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Credenciales inválidas'
        });
      }
      
      // Generate token with both id and id_usuario to ensure compatibility
      const token = jwt.sign(
        { 
          id: user.id, 
          id_usuario: user.id,  // Include both formats for compatibility
          email: user.email,
          rol: user.rol || 'usuario'  // Include the role in the token
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Return success with user data and token
      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        user,
        token
      });
      
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        error: 'Error al iniciar sesión',
        details: error.message
      });
    }
  }
  
  // Verify user token (middleware)
  verifyToken(req, res, next) {
    try {
      console.log('Verifying token from headers:', req.headers.authorization);
      
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith('Bearer ') 
        ? authHeader.split(' ')[1] 
        : authHeader;
      
      if (!token) {
        console.error('No token provided in request');
        return res.status(401).json({
          success: false,
          error: 'Token no proporcionado'
        });
      }
      
      console.log('Verifying token:', token);
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Decoded token payload:', decoded);
      
      req.user = decoded;
      
      next();
    } catch (error) {
      console.error('Error verificando token:', error);
      res.status(401).json({
        success: false,
        error: 'Token inválido o expirado'
      });
    }
  }

  // Check if user is a vendor (middleware)
  verifyVendorRole(req, res, next) {
    try {
      // Token should be verified first with verifyToken middleware
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
      }

      console.log('Verifying vendor role for user:', req.user);
      
      if (req.user.rol !== 'vendedor') {
        console.error('Access denied: user is not a vendor');
        return res.status(403).json({
          success: false,
          error: 'Acceso denegado. Se requiere rol de vendedor.'
        });
      }
      
      next();
    } catch (error) {
      console.error('Error verificando rol de vendedor:', error);
      res.status(500).json({
        success: false,
        error: 'Error al verificar permisos'
      });
    }
  }
}

export default new AuthController();
