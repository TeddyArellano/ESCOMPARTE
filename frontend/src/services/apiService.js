// Configuración base de la API
const API_BASE_URL = import.meta.env.DEV 
  ? '/api'  // En desarrollo usa el proxy de Vite
  : 'http://localhost:8080/api';  // En producción usa ruta directa al backend

// Función auxiliar para hacer peticiones HTTP
const fetchAPI = async (endpoint, options = {}) => {
  // Ya no necesitamos .php para la nueva API Node.js
  const url = `${API_BASE_URL}/${endpoint}`;
  
  const token = localStorage.getItem('token');
  
  let defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  // Incluir el token de autenticación si existe
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Si estamos enviando un FormData, no incluir el Content-Type
  if (options.body instanceof FormData) {
    delete defaultOptions.headers['Content-Type'];
    
    // Si hay headers en options, asegurarnos de que tampoco tengan Content-Type
    if (options.headers) {
      delete options.headers['Content-Type'];
    }
  }
  
  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {}),
    },
  };
  
  try {
    console.log(`Fetching ${finalOptions.method || 'GET'} ${url}`, finalOptions);
    
    const response = await fetch(url, finalOptions);
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    // Verificar si la respuesta es JSON
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    // Check if response was not ok (status outside the 200-299 range)
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Error en la solicitud');
    }
    
    console.log('Response data:', data);
    
    if (!response.ok) {
      throw new Error(
        typeof data === 'object' && data.error 
          ? data.error 
          : (typeof data === 'string' ? data : `HTTP error! status: ${response.status}`)
      );
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Servicios de autenticación
export const authService = {
  // Registrar nuevo usuario
  register: async (userData) => {
    return await fetchAPI('auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  // Iniciar sesión
  login: async (credentials) => {
    console.log('Enviando credenciales a auth/login:', credentials);
    try {
      const response = await fetchAPI('auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      console.log('Respuesta del login:', response);
      return response;
    } catch (error) {
      console.error('Error en login service:', error);
      throw error;
    }
  },
  
  // Obtener usuario actual
  getCurrentUser: async () => {
    return await fetchAPI('auth/me');
  },
  
  // Test de conexión
  test: async () => {
    return await fetchAPI('test');
  }
};

// Servicio para usuarios
export const userService = {
  // Obtener detalles del usuario
  getUserDetails: async () => {
    console.log('Fetching user details...');
    const response = await fetchAPI('user/me');
    console.log('User details response:', response);
    return response;
  },
  
  // Actualizar perfil de usuario
  updateUserProfile: async (userData) => {
    console.log('Updating user profile with data:', userData);
    const response = await fetchAPI('user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    console.log('Update profile response:', response);
    return response.user;
  },
  
  // Obtener historial de pedidos
  getOrderHistory: async () => {
    console.log('Fetching order history...');
    const response = await fetchAPI('user/orders');
    console.log('Order history response:', response);
    return response;
  },
  
  // Obtener detalles de un pedido específico
  getOrderDetails: async (orderId) => {
    console.log(`Fetching details for order ${orderId}...`);
    const response = await fetchAPI(`user/orders/${orderId}`);
    console.log('Order details response:', response);
    return response.order;
  },
  
  // Solicitar rol de vendedor
  requestVendorRole: async (reason) => {
    console.log('Requesting vendor role with reason:', reason);
    const response = await fetchAPI('user/role/request', {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
    console.log('Vendor role request response:', response);
    return response;
  },
};

// Servicios de productos
export const productService = {
  // Obtener todos los productos (público)
  getAllProducts: async () => {
    const response = await fetchAPI('productos');
    return response;
  },
  
  // Obtener producto por ID (público)
  getProductById: async (productId) => {
    const response = await fetchAPI(`productos/${productId}`);
    return response;
  },
  
  // Obtener productos del vendedor (requiere autenticación y rol de vendedor)
  getVendorProducts: async () => {
    console.log('Fetching vendor products...');
    const response = await fetchAPI('productos/mis-productos');
    console.log('Vendor products response:', response);
    return response;
  },
  
  // Crear nuevo producto (requiere autenticación y rol de vendedor)
  createProduct: async (formData) => {
    console.log('Creating new product...');
    
    // Si formData es un objeto FormData, no necesitamos convertirlo a JSON
    const isFormData = formData instanceof FormData;
    
    // Si es FormData, eliminar los headers de Content-Type para que el navegador establezca el boundary correcto
    const options = {
      method: 'POST',
      body: isFormData ? formData : JSON.stringify(formData),
    };
    
    // Solo usar headers por defecto si NO es FormData
    if (!isFormData) {
      options.headers = {
        'Content-Type': 'application/json'
      };
    }
    
    const response = await fetchAPI('productos', options);
    
    console.log('Create product response:', response);
    return response;
  },
  
  // Actualizar producto (requiere autenticación y rol de vendedor)
  updateProduct: async (productId, formData) => {
    console.log(`Updating product ${productId}...`);
    
    // Si formData es un objeto FormData, no necesitamos convertirlo a JSON
    const isFormData = formData instanceof FormData;
    
    // Si es FormData, eliminar los headers de Content-Type para que el navegador establezca el boundary correcto
    const options = {
      method: 'PUT',
      body: isFormData ? formData : JSON.stringify(formData),
    };
    
    // Solo usar headers por defecto si NO es FormData
    if (!isFormData) {
      options.headers = {
        'Content-Type': 'application/json'
      };
    }
    
    const response = await fetchAPI(`productos/${productId}`, options);
    
    console.log('Update product response:', response);
    return response;
  },
  
  // Eliminar producto (requiere autenticación y rol de vendedor)
  deleteProduct: async (productId) => {
    console.log(`Deleting product ${productId}...`);
    const response = await fetchAPI(`productos/${productId}`, {
      method: 'DELETE',
    });
    console.log('Delete product response:', response);
    return response;
  },
  
  // Añadir imagen a un producto (requiere autenticación y rol de vendedor)
  addProductImage: async (productId, imageFile) => {
    console.log(`Adding image to product ${productId}...`);
    
    const formData = new FormData();
    formData.append('imagen', imageFile);
    
    const response = await fetchAPI(`productos/${productId}/images`, {
      method: 'POST',
      body: formData,
      // No incluir el header Content-Type para que el navegador establezca el boundary correcto
    });
    
    console.log('Add product image response:', response);
    return response;
  },
};

// Servicios del carrito
export const cartService = {
  // Obtener el carrito del usuario
  getCart: async () => {
    const response = await fetchAPI('carrito');
    return response.data;
  },
  
  // Añadir un producto al carrito
  addToCart: async (productId, quantity = 1) => {
    const response = await fetchAPI('carrito/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
    return response.data;
  },
  
  // Actualizar la cantidad de un producto en el carrito
  updateQuantity: async (itemId, quantity) => {
    const response = await fetchAPI(`carrito/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
    return response.data;
  },
  
  // Eliminar un producto del carrito
  removeItem: async (itemId) => {
    await fetchAPI(`carrito/items/${itemId}`, {
      method: 'DELETE',
    });
    return true;
  },
  
  // Vaciar el carrito
  clearCart: async () => {
    await fetchAPI('carrito/clear', {
      method: 'DELETE',
    });
    return true;
  },
};

// Servicio para validaciones
export const validationService = {
  // Validar email
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // Validar contraseña
  isValidPassword: (password) => {
    return password && password.length >= 8;
  },
  
  // Validar que las contraseñas coincidan
  passwordsMatch: (password, confirmPassword) => {
    return password === confirmPassword;
  },
};

// Exportar servicios para uso global
export default {
  auth: authService,
  user: userService,
  product: productService,
  cart: cartService,
  validation: validationService,
};
