import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { authService, validationService } from "../../services/apiService";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import "./LoginPage.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
    
    // Limpiar error del campo cuando se modifica
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = "El email es obligatorio";
    } else if (!validationService.isValidEmail(formData.email)) {
      errors.email = "El formato de email no es válido";
    }
    
    if (!formData.password) {
      errors.password = "La contraseña es obligatoria";
    }
    
    return errors;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setLoading(true);
    setFormErrors({});
    
    try {
      console.log("Enviando solicitud de login con:", {
        email: formData.email,
        password: formData.password
      });
      
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });
      
      console.log("Respuesta del servidor:", response);
      
      // Verificar si la respuesta tiene la estructura esperada
      if (response && (response.success || (response.data && response.data.success))) {
        // Extraer datos del usuario según la estructura de la respuesta
        const userData = response.user || (response.data ? response.data.user : null);
        
        if (!userData) {
          console.error("Respuesta de login no contiene datos de usuario:", response);
          throw new Error("La respuesta del servidor no incluye datos del usuario");
        }
        
        // Asegurar que el token esté incluido en los datos del usuario
        const token = response.token || 
                    (response.data && response.data.token) || 
                    userData.token;
                    
        if (!token) {
          console.error("Respuesta de login no contiene token:", response);
          throw new Error("La respuesta del servidor no incluye token de autenticación");
        }
        
        // Guardar usuario y token en el contexto
        const userWithToken = {
          ...userData,
          token
        };
        
        login(userWithToken);
        
        // Guardar token explícitamente para las llamadas API
        localStorage.setItem('token', token);
        
        // Redirigir al usuario
        navigate('/');
      } else {
        const errorMessage = response.error || 
                           (response.data && response.data.error) || 
                           "Error al iniciar sesión";
        setFormErrors({
          submit: errorMessage
        });
      }
    } catch (error) {
      console.error('Error de login:', error);
      setFormErrors({
        submit: error.message || "Ha ocurrido un error al iniciar sesión. Verifica tus credenciales e inténtalo de nuevo."
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleForgotPassword = (e) => {
    e.preventDefault();
    // En un caso real, aquí redirigimos a la página de recuperación de contraseña
    navigate('/recuperar-contrasena');
  };
  
  return (
    <div className="escomparte">
      <Header />
      <div className="escomparte__container">
        <main className="login-page">
          <section className="login-hero">
            <h1>Iniciar Sesión</h1>
            <p>Accede a tu cuenta para gestionar tus componentes y solicitudes</p>
          </section>
          
          <div className="login-content">
            <div className="login-form-container">
              <h2 className="login-form-title">Bienvenido de nuevo</h2>
              
              <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Email <span className="required">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu.email@ejemplo.com"
                    className={formErrors.email ? "error" : ""}
                  />
                  {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Contraseña <span className="required">*</span></label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={formErrors.password ? "error" : ""}
                  />
                  {formErrors.password && <span className="error-message">{formErrors.password}</span>}
                </div>
                
                <div className="login-options">
                  <div className="remember-me">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                      />
                      <span>Recordarme</span>
                    </label>
                  </div>
                  <div className="forgot-password">
                    <a href="#" onClick={handleForgotPassword}>¿Olvidaste tu contraseña?</a>
                  </div>
                </div>
                
                {formErrors.submit && (
                  <div className="form-error-message">
                    <p>{formErrors.submit}</p>
                  </div>
                )}
                
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <span className="loading-spinner">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="2" x2="12" y2="6"></line>
                          <line x1="12" y1="18" x2="12" y2="22"></line>
                          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                          <line x1="2" y1="12" x2="6" y2="12"></line>
                          <line x1="18" y1="12" x2="22" y2="12"></line>
                          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                        </svg>
                        Iniciando sesión...
                      </span>
                    ) : "Iniciar Sesión"}
                  </button>
                </div>
              </form>
              
              <div className="login-divider">
                <span>O</span>
              </div>
              
              <div className="social-login">
                <button className="btn btn-social btn-google">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continuar con Google
                </button>
                <button className="btn btn-social btn-microsoft">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                  </svg>
                  Continuar con Microsoft
                </button>
              </div>
              
              <div className="register-link">
                ¿No tienes una cuenta? <Link to="/registro">Regístrate</Link>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;
