import React, { useState } from "react";
import "./ContactForm.css";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
    tipo: "consulta"
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: false,
    message: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.nombre || !formData.email || !formData.mensaje) {
      setFormStatus({
        submitted: false,
        error: true,
        message: "Por favor complete todos los campos obligatorios."
      });
      return;
    }
    
    // En un caso real, aquí enviaríamos los datos a un servidor
    // Simulamos una respuesta exitosa después de 1 segundo
    setFormStatus({
      submitted: false,
      error: false,
      message: "Enviando mensaje..."
    });
    
    setTimeout(() => {
      setFormStatus({
        submitted: true,
        error: false,
        message: "¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto."
      });
      
      // Reiniciar el formulario
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        mensaje: "",
        tipo: "consulta"
      });
    }, 1000);
  };

  return (
    <section className="contact-form-section">
      <div className="contact-form-container">
        <h2 className="contact-form-title">Contacto</h2>
        <p className="contact-form-description">
          ¿Tienes preguntas sobre algún componente? ¿Quieres ofrecer tus propios componentes para intercambio o donación? 
          Completa este formulario y nos pondremos en contacto contigo.
        </p>
        
        {formStatus.submitted ? (
          <div className="form-success-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 12l2 2 4-4"></path>
            </svg>
            <p>{formStatus.message}</p>
            <button 
              className="contact-form-button"
              onClick={() => setFormStatus({ submitted: false, error: false, message: "" })}
            >
              Enviar otro mensaje
            </button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="tipo">Tipo de mensaje</label>
              <select 
                id="tipo" 
                name="tipo" 
                value={formData.tipo}
                onChange={handleChange}
              >
                <option value="consulta">Consulta sobre un componente</option>
                <option value="ofrecer">Ofrecer un componente</option>
                <option value="donacion">Donación de componentes</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre completo <span className="required">*</span></label>
                <input 
                  type="text" 
                  id="nombre" 
                  name="nombre" 
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  className={formStatus.error && !formData.nombre ? "error" : ""}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email <span className="required">*</span></label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu.email@ejemplo.com"
                  className={formStatus.error && !formData.email ? "error" : ""}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="telefono">Teléfono (opcional)</label>
              <input 
                type="tel" 
                id="telefono" 
                name="telefono" 
                value={formData.telefono}
                onChange={handleChange}
                placeholder="(+52) 55 1234 5678"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="mensaje">Mensaje <span className="required">*</span></label>
              <textarea 
                id="mensaje" 
                name="mensaje" 
                value={formData.mensaje}
                onChange={handleChange}
                placeholder="Escribe tu mensaje aquí..."
                rows="6"
                className={formStatus.error && !formData.mensaje ? "error" : ""}
              ></textarea>
            </div>
            
            {formStatus.error && (
              <div className="form-error-message">
                <p>{formStatus.message}</p>
              </div>
            )}
            
            {formStatus.message && !formStatus.error && !formStatus.submitted && (
              <div className="form-info-message">
                <p>{formStatus.message}</p>
              </div>
            )}
            
            <div className="form-actions">
              <button type="submit" className="contact-form-button">
                Enviar mensaje
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};

export default ContactForm;
