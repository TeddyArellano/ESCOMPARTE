import React, { useState } from 'react';
import { userService } from '../../services/apiService';
import { useAuth } from '../../contexts/AuthContext';
import './UserProfile.css';

const UserProfile = ({ userData }) => {
  const { login, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: userData?.nombre || '',
    p_apellido: userData?.p_apellido || '',
    s_apellido: userData?.s_apellido || '',
    correo: userData?.correo || '',
    telefono: userData?.telefono || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Add state for vendor request
  const [requestingVendorRole, setRequestingVendorRole] = useState(false);
  const [vendorRequestSuccess, setVendorRequestSuccess] = useState(false);
  const [vendorReason, setVendorReason] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setError(null);
    setSuccess(null);
    // Reset form data to current user data when toggling edit mode
    if (!isEditing) {
      setFormData({
        nombre: userData?.nombre || '',
        p_apellido: userData?.p_apellido || '',
        s_apellido: userData?.s_apellido || '',
        correo: userData?.correo || '',
        telefono: userData?.telefono || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate passwords if the user is trying to change it
    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        setError('Debe proporcionar su contraseña actual para cambiarla');
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('Las contraseñas nuevas no coinciden');
        return;
      }

      if (formData.newPassword.length < 6) {
        setError('La nueva contraseña debe tener al menos 6 caracteres');
        return;
      }
    }

    try {
      const updatedUser = await userService.updateUserProfile({
        nombre: formData.nombre,
        p_apellido: formData.p_apellido,
        s_apellido: formData.s_apellido,
        telefono: formData.telefono,
        correo: formData.correo,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword || null
      });

      // Update auth context with new user data
      login(updatedUser);
      setSuccess('Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Error al actualizar el perfil');
    }
  };

  // Function to handle vendor role request
  const handleVendorRequest = async (e) => {
    e.preventDefault();
    if (!vendorReason.trim()) {
      setError('Por favor, proporcione una razón para convertirse en vendedor.');
      return;
    }

    try {
      setRequestingVendorRole(true);
      setError(null);
      setSuccess(null);
      
      const response = await userService.requestVendorRole(vendorReason);
      
      if (response && response.success) {
        setVendorRequestSuccess(true);
        setVendorReason('');
        
        // If the role was immediately updated, update the user context
        if (response.userUpdated && response.user) {
          console.log('Rol actualizado a vendedor:', response.user);
          
          // Mostrar mensaje de éxito
          setSuccess('¡Felicidades! Tu solicitud ha sido aprobada y ahora eres vendedor. Se cerrará tu sesión para aplicar los cambios.');
          
          // Programar un cierre de sesión para aplicar los cambios
          setTimeout(() => {
            logout();
            // Opcionalmente, podríamos redirigir a la página de login
          }, 5000);
        } else {
          // Si no se actualizó automáticamente (configuración de producción)
          setSuccess('Tu solicitud para convertirte en vendedor ha sido enviada correctamente. Te notificaremos cuando sea aprobada.');
        }
      } else {
        setError(`Error al enviar solicitud: ${response?.message || 'Error desconocido'}`);
      }
    } catch (err) {
      console.error('Error al solicitar rol de vendedor:', err);
      setError(`Error al enviar solicitud: ${err.message || 'Error desconocido'}`);
    } finally {
      setRequestingVendorRole(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      handleSubmit(e);
    }
  };

  return (
    <div className="user-profile">
      <div className="user-profile__header">
        <h2 className="user-profile__title">Información Personal</h2>
        <button 
          className="user-profile__edit-btn" 
          onClick={toggleEdit}
          type="button"
        >
          {isEditing ? 'Cancelar' : 'Editar Perfil'}
        </button>
      </div>

      {error && (
        <div className="user-profile__alert user-profile__alert--error">
          {error}
        </div>
      )}

      {success && (
        <div className="user-profile__alert user-profile__alert--success">
          {success}
        </div>
      )}

      <div className="user-profile__section">
        <h3 className="user-profile__subtitle">Información Personal</h3>
        <form className="user-profile__form" onSubmit={handleFormSubmit}>
          <div className="user-profile__form-group">
            <label className="user-profile__label" htmlFor="nombre">Nombre</label>
            {isEditing ? (
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="user-profile__input"
                required
              />
            ) : (
              <p className="user-profile__value">{userData?.nombre || 'No disponible'}</p>
            )}
          </div>

          <div className="user-profile__form-group">
            <label className="user-profile__label" htmlFor="p_apellido">Primer Apellido</label>
            {isEditing ? (
              <input
                type="text"
                id="p_apellido"
                name="p_apellido"
                value={formData.p_apellido}
                onChange={handleChange}
                className="user-profile__input"
                required
              />
            ) : (
              <p className="user-profile__value">{userData?.p_apellido || 'No disponible'}</p>
            )}
          </div>

          <div className="user-profile__form-group">
            <label className="user-profile__label" htmlFor="s_apellido">Segundo Apellido</label>
            {isEditing ? (
              <input
                type="text"
                id="s_apellido"
                name="s_apellido"
                value={formData.s_apellido}
                onChange={handleChange}
                className="user-profile__input"
              />
            ) : (
              <p className="user-profile__value">{userData?.s_apellido || 'No disponible'}</p>
            )}
          </div>

          <div className="user-profile__form-group">
            <label className="user-profile__label" htmlFor="correo">Correo Electrónico</label>
            {isEditing ? (
              <input
                type="email"
                id="correo"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                className="user-profile__input"
                required
              />
            ) : (
              <p className="user-profile__value">{userData?.correo || 'No disponible'}</p>
            )}
          </div>

          <div className="user-profile__form-group">
            <label className="user-profile__label" htmlFor="telefono">Teléfono</label>
            {isEditing ? (
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="user-profile__input"
              />
            ) : (
              <p className="user-profile__value">{userData?.telefono || 'No disponible'}</p>
            )}
          </div>

          {isEditing && (
            <div className="user-profile__password-section">
              <h3 className="user-profile__subtitle">Cambiar Contraseña</h3>
              
              <div className="user-profile__form-group">
                <label className="user-profile__label" htmlFor="currentPassword">Contraseña Actual</label>
                <div className="user-profile__password-input-wrapper">
                  <input
                    type={passwordVisible ? "text" : "password"}
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="user-profile__input"
                  />
                  <button 
                    type="button" 
                    className="user-profile__password-toggle"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </div>
              
              <div className="user-profile__form-group">
                <label className="user-profile__label" htmlFor="newPassword">Nueva Contraseña</label>
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="user-profile__input"
                />
              </div>
              
              <div className="user-profile__form-group">
                <label className="user-profile__label" htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="user-profile__input"
                />
              </div>
            </div>
          )}

          {isEditing && (
            <div className="user-profile__actions">
              <button type="submit" className="user-profile__submit">
                Guardar Cambios
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Display user role */}
      <div className="user-profile__section">
        <h3 className="user-profile__subtitle">Rol de Usuario</h3>
        <div className="user-profile__form-group">
          <label className="user-profile__label">Rol Actual</label>
          <p className="user-profile__value">
            {userData?.rol === 'vendedor' ? (
              <>
                <span className="user-profile__badge user-profile__badge--vendor">Vendedor</span>
                <span className="user-profile__vendor-info">
                  Ya tienes acceso a todas las funcionalidades de vendedor, incluyendo la gestión de productos en "Mis Productos".
                </span>
              </>
            ) : (
              <span className="user-profile__badge">Usuario</span>
            )}
          </p>
        </div>
        
        {userData?.rol !== 'vendedor' && vendorRequestSuccess === null && (
          <div className="user-profile__actions">
            <button 
              type="button"
              className="user-profile__button user-profile__button--secondary"
              onClick={() => setVendorRequestSuccess(false)}
            >
              Solicitar convertirse en vendedor
            </button>
          </div>
        )}
      </div>

      {/* Vendor role request form */}
      {!isEditing && userData?.rol !== 'vendedor' && vendorRequestSuccess === false && (
        <div className="user-profile__section vendor-request-section">
          <h3 className="user-profile__subtitle">Solicitud para ser Vendedor</h3>
          <p className="user-profile__note">
            Como vendedor, podrás publicar y administrar productos en la plataforma.
            Por favor, cuéntanos por qué quieres convertirte en vendedor y cómo planeas usar nuestra plataforma.
          </p>
          
          <form className="user-profile__form" onSubmit={handleVendorRequest}>
            <div className="user-profile__form-group">
              <label className="user-profile__label" htmlFor="vendorReason">Razón para convertirse en vendedor</label>
              <textarea
                id="vendorReason"
                name="vendorReason"
                value={vendorReason}
                onChange={(e) => setVendorReason(e.target.value)}
                className="user-profile__input vendor-reason-textarea"
                rows="4"
                placeholder="Explica por qué quieres convertirte en vendedor y qué tipo de productos planeas ofrecer..."
                required
              />
              <p className="user-profile__helper-text">
                Proporciona detalles sobre tu experiencia, productos que planeas vender y por qué quieres unirte a nuestra plataforma como vendedor.
              </p>
            </div>

            <div className="user-profile__actions">
              <button 
                type="submit" 
                className="user-profile__submit"
                disabled={requestingVendorRole}
              >
                {requestingVendorRole ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
              <button 
                type="button" 
                className="user-profile__cancel"
                onClick={() => setVendorRequestSuccess(null)}
                disabled={requestingVendorRole}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Success message after submitting vendor request */}
      {vendorRequestSuccess && (
        <div className="user-profile__section vendor-request-success">
          <h3 className="user-profile__subtitle">Solicitud Enviada</h3>
          <div className="vendor-request-success__content">
            <div className="vendor-request-success__icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <p className="vendor-request-success__message">
              {success || 'Tu solicitud para convertirte en vendedor ha sido enviada correctamente.'}
            </p>
            <div className="vendor-request-success__timer">
              {success && success.includes('ahora eres vendedor') && (
                <p className="vendor-request-success__redirect-info">
                  Serás redirigido a la página de inicio de sesión en unos momentos...
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
