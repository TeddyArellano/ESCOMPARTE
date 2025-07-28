import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto de autenticación
const AuthContext = createContext();

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay un usuario guardado en localStorage al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem('escomparte_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error al cargar usuario guardado:', error);
        localStorage.removeItem('escomparte_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Función para iniciar sesión
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('escomparte_user', JSON.stringify(userData));
    
    // Guardar el token por separado para facilitar su uso en las llamadas a la API
    if (userData && userData.token) {
      localStorage.setItem('token', userData.token);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem('escomparte_user');
    localStorage.removeItem('token');
  };

  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    const hasUser = user !== null;
    const hasToken = !!localStorage.getItem('token');
    
    // Para considerar autenticado, necesitamos tanto usuario como token
    return hasUser && hasToken;
  };
  
  // Verificar si el usuario es un vendedor
  const isVendor = () => {
    return isAuthenticated() && user?.rol === 'vendedor';
  };

  // Obtener el nombre completo del usuario
  const getUserDisplayName = () => {
    if (!user) return '';
    return user.nombre || user.username || 'Usuario';
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated,
    isVendor,
    getUserDisplayName
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
