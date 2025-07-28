import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { authService, validationService } from "../../services/apiService";
import "./RegisterPage.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    password: "",
    confirmPassword: "",
    escuela: "",
    carrera: "",
    semestre: "",
    aceptaTerminos: false
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
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
    
    if (!formData.nombre.trim()) {
      errors.nombre = "El nombre es obligatorio";
    }
    
    if (!formData.apellidos.trim()) {
      errors.apellidos = "Los apellidos son obligatorios";
    }
    
    if (!formData.email.trim()) {
      errors.email = "El email es obligatorio";
    } else if (!validationService.isValidEmail(formData.email)) {
      errors.email = "El formato de email no es válido";
    }
    
    if (!formData.password) {
      errors.password = "La contraseña es obligatoria";
    } else if (!validationService.isValidPassword(formData.password)) {
      errors.password = "La contraseña debe tener al menos 8 caracteres";
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Debes confirmar la contraseña";
    } else if (!validationService.passwordsMatch(formData.password, formData.confirmPassword)) {
      errors.confirmPassword = "Las contraseñas no coinciden";
    }
    
    if (!formData.escuela.trim()) {
      errors.escuela = "La escuela/facultad es obligatoria";
    }
    
    if (!formData.carrera.trim()) {
      errors.carrera = "La carrera es obligatoria";
    }
    
    if (!formData.aceptaTerminos) {
      errors.aceptaTerminos = "Debes aceptar los términos y condiciones";
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
      // Preparar datos para enviar al backend
      const userData = {
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        email: formData.email,
        password: formData.password,
        escuela: formData.escuela,
        carrera: formData.carrera,
        semestre: formData.semestre
      };
      
      // Enviar datos al servidor
      const response = await authService.register(userData);
      
      if (response.success) {
        // Hacer login automático después del registro exitoso
        login(response.user);
        setFormSubmitted(true);
        setFormErrors({});
        
        // Redirigir después de un momento para mostrar el mensaje de éxito
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setFormErrors({
          submit: response.error || "Error al registrar la cuenta"
        });
      }
    } catch (error) {
      console.error('Error de registro:', error);
      setFormErrors({
        submit: error.message || "Ha ocurrido un error al registrar tu cuenta. Verifica tu conexión e inténtalo de nuevo."
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="escomparte">
      <Header />
      <div className="escomparte__container">
        <main className="register-page">
          <section className="register-hero">
            <h1>Únete a ESCOMPARTE</h1>
            <p>Crea tu cuenta para intercambiar, donar y solicitar componentes electrónicos</p>
          </section>
          
          <div className="register-content">
            {formSubmitted ? (
              <div className="register-success">
                <div className="register-success-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <h2>¡Registro completado!</h2>
                <p>Tu cuenta ha sido creada exitosamente. Te hemos enviado un correo para verificar tu dirección de email.</p>
                <div className="register-success-actions">
                  <Link to="/login" className="btn btn-primary">Iniciar Sesión</Link>
                  <Link to="/" className="btn btn-secondary">Volver al Inicio</Link>
                </div>
              </div>
            ) : (
              <div className="register-form-container">
                <h2 className="register-form-title">Registro de Usuario</h2>
                
                <form className="register-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="nombre">Nombre <span className="required">*</span></label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className={formErrors.nombre ? "error" : ""}
                      />
                      {formErrors.nombre && <span className="error-message">{formErrors.nombre}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="apellidos">Apellidos <span className="required">*</span></label>
                      <input
                        type="text"
                        id="apellidos"
                        name="apellidos"
                        value={formData.apellidos}
                        onChange={handleChange}
                        className={formErrors.apellidos ? "error" : ""}
                      />
                      {formErrors.apellidos && <span className="error-message">{formErrors.apellidos}</span>}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email <span className="required">*</span></label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={formErrors.email ? "error" : ""}
                    />
                    {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                  </div>
                  
                  <div className="form-row">
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
                    
                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirmar Contraseña <span className="required">*</span></label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={formErrors.confirmPassword ? "error" : ""}
                      />
                      {formErrors.confirmPassword && <span className="error-message">{formErrors.confirmPassword}</span>}
                    </div>
                  </div>
                  
                  <div className="form-divider">
                    <span>Información Académica</span>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="escuela">Escuela/Facultad <span className="required">*</span></label>
                    <input
                      type="text"
                      id="escuela"
                      name="escuela"
                      value={formData.escuela}
                      onChange={handleChange}
                      placeholder="Ej. Escuela Superior de Cómputo"
                      className={formErrors.escuela ? "error" : ""}
                    />
                    {formErrors.escuela && <span className="error-message">{formErrors.escuela}</span>}
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="carrera">Carrera <span className="required">*</span></label>
                      <input
                        type="text"
                        id="carrera"
                        name="carrera"
                        value={formData.carrera}
                        onChange={handleChange}
                        placeholder="Ej. Ingeniería en Sistemas Computacionales"
                        className={formErrors.carrera ? "error" : ""}
                      />
                      {formErrors.carrera && <span className="error-message">{formErrors.carrera}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="semestre">Semestre</label>
                      <select 
                        id="semestre" 
                        name="semestre" 
                        value={formData.semestre}
                        onChange={handleChange}
                      >
                        <option value="">Selecciona tu semestre</option>
                        <option value="1">1er Semestre</option>
                        <option value="2">2do Semestre</option>
                        <option value="3">3er Semestre</option>
                        <option value="4">4to Semestre</option>
                        <option value="5">5to Semestre</option>
                        <option value="6">6to Semestre</option>
                        <option value="7">7mo Semestre</option>
                        <option value="8">8vo Semestre</option>
                        <option value="9">9no Semestre</option>
                        <option value="10">10mo Semestre</option>
                        <option value="egresado">Egresado</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="aceptaTerminos"
                        checked={formData.aceptaTerminos}
                        onChange={handleChange}
                        className={formErrors.aceptaTerminos ? "error" : ""}
                      />
                      <span>Acepto los <Link to="/terminos-condiciones">términos y condiciones</Link> y la <Link to="/privacidad">política de privacidad</Link></span>
                    </label>
                    {formErrors.aceptaTerminos && <span className="error-message">{formErrors.aceptaTerminos}</span>}
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
                          Procesando...
                        </span>
                      ) : "Crear Cuenta"}
                    </button>
                  </div>
                </form>
                
                <div className="register-divider">
                  <span>O regístrate con</span>
                </div>
                
                <div className="social-login">
                  <button className="btn btn-social btn-google" onClick={() => alert("Registro con Google no implementado")}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Registrarse con Google
                  </button>
                  <button className="btn btn-social btn-microsoft" onClick={() => alert("Registro con Microsoft no implementado")}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                    </svg>
                    Registrarse con Microsoft
                  </button>
                </div>
                
                <div className="register-login-link">
                  ¿Ya tienes una cuenta? <Link to="/login">Inicia Sesión</Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;
