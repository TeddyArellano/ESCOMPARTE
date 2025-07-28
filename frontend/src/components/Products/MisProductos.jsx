import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { productService } from "../../services/apiService";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import "./MisProductos.css";

const estados = [
  { value: "nuevo", label: "Nuevo" },
  { value: "usado", label: "Usado" },
  { value: "donacion", label: "Donación" }
];

const MisProductos = () => {
  const { isAuthenticated, isVendor } = useAuth();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    existencia: "",
    precio: "",
    estado: "",
    imagen: null
  });
  const [editProductId, setEditProductId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Verificar si el usuario es un vendedor
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/mis-productos', message: 'Debe iniciar sesión para ver esta página' } });
      return;
    }
    
    if (!isVendor()) {
      navigate('/', { state: { error: 'No tiene permisos para acceder a esta página' } });
      return;
    }
    
    fetchProducts();
  }, [isAuthenticated, isVendor, navigate]);

  // Obtener productos del vendedor
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getVendorProducts();
      console.log('Vendor products:', response);
      
      if (response && response.success) {
        setProductos(response.data || []);
        setError(null);
      } else {
        setError('Error al cargar los productos: ' + (response?.error || 'Error desconocido'));
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Error al cargar los productos: ' + (err.message || 'Error de conexión'));
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = e => {
    const { name, value, type, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "file" ? files[0] : value
    }));
  };

  // Manejar envío del formulario (agregar o actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Crear FormData para enviar archivos
      const formData = new FormData();
      formData.append('nombre', form.nombre);
      formData.append('descripcion', form.descripcion);
      formData.append('existencia', form.existencia);
      formData.append('precio', form.precio);
      formData.append('estado', form.estado);
      
      // Si hay una imagen nueva, adjuntarla al FormData
      if (form.imagen) {
        formData.append('imagen', form.imagen);
        console.log('Añadiendo imagen al formulario:', form.imagen.name);
      }
      
      let response;
      
      if (editProductId) {
        // Actualizar producto
        response = await productService.updateProduct(editProductId, formData);
      } else {
        // Crear nuevo producto
        response = await productService.createProduct(formData);
      }
      
      if (response && response.success) {
        // Recargar productos
        await fetchProducts();
        
        // Resetear formulario
        setForm({
          nombre: "",
          descripcion: "",
          existencia: "",
          precio: "",
          estado: "",
          imagen: null
        });
        
        setEditProductId(null);
        setShowForm(false);
      } else {
        setError('Error: ' + (response?.error || 'No se pudo guardar el producto'));
      }
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Error al guardar el producto: ' + (err.message || 'Error desconocido'));
    } finally {
      setSubmitting(false);
    }
  };

  // Editar producto
  const handleEdit = (product) => {
    setForm({
      nombre: product.nombre,
      descripcion: product.descripcion,
      existencia: product.existencia,
      precio: product.precio,
      estado: product.estado,
      imagen: null // No podemos recuperar el archivo original, solo la URL
    });
    setEditProductId(product.id_producto);
    setShowForm(true);
  };

  // Borrar producto
  const handleDelete = async (productId) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este producto?')) {
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await productService.deleteProduct(productId);
      
      if (response && response.success) {
        // Actualizar la lista de productos
        setProductos(productos.filter(p => p.id_producto !== productId));
        
        if (editProductId === productId) {
          setEditProductId(null);
          setShowForm(false);
        }
      } else {
        setError('Error al eliminar el producto: ' + (response?.error || 'Error desconocido'));
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Error al eliminar el producto: ' + (err.message || 'Error de conexión'));
    } finally {
      setSubmitting(false);
    }
  };

  // Cancelar edición o registro
  const handleCancel = () => {
    setForm({
      nombre: "",
      descripcion: "",
      existencia: "",
      precio: "",
      estado: "",
      imagen: null
    });
    setEditProductId(null);
    setShowForm(false);
  };

  return (
    <div className="escomparte">
      <Header />
      <div className="escomparte__container">
        <div className="misproductos__container">
          <section className="misproductos-hero">
            <h1>Gestión de Mis Productos</h1>
            <p>Sube, actualiza o elimina tus productos fácilmente.</p>
          </section>

          {error && (
            <div className="misproductos-error">
              {error}
            </div>
          )}

          <div className="misproductos-actions">
            {!showForm ? (
              <button 
                className="misproductos-add-btn" 
                onClick={() => setShowForm(true)}
                disabled={submitting}
              >
                + Agregar Producto
              </button>
            ) : (
              <div className="misproductos-form-container">
                <h2>{editProductId ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h2>
                <form className="misproductos-form" onSubmit={handleSubmit}>
                  <div className="misproductos-form-group">
                    <label htmlFor="nombre">Nombre del Producto*</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      placeholder="Ej. Calculadora Científica"
                      required
                    />
                  </div>
                  
                  <div className="misproductos-form-group">
                    <label htmlFor="descripcion">Descripción*</label>
                    <textarea
                      id="descripcion"
                      name="descripcion"
                      value={form.descripcion}
                      onChange={handleChange}
                      placeholder="Detalles del producto"
                      rows="4"
                      required
                    />
                  </div>

                  <div className="misproductos-form-row">
                    <div className="misproductos-form-group">
                      <label htmlFor="precio">Precio (MXN)*</label>
                      <input
                        type="number"
                        id="precio"
                        name="precio"
                        value={form.precio}
                        onChange={handleChange}
                        placeholder="Ej. 150.00"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    
                    <div className="misproductos-form-group">
                      <label htmlFor="existencia">Cantidad Disponible*</label>
                      <input
                        type="number"
                        id="existencia"
                        name="existencia"
                        value={form.existencia}
                        onChange={handleChange}
                        placeholder="Ej. 5"
                        min="1"
                        required
                      />
                    </div>
                    
                    <div className="misproductos-form-group">
                      <label htmlFor="estado">Estado*</label>
                      <select
                        id="estado"
                        name="estado"
                        value={form.estado}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccione...</option>
                        {estados.map(estado => (
                          <option key={estado.value} value={estado.value}>
                            {estado.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="misproductos-form-group">
                    <label htmlFor="imagen">Imagen del Producto</label>
                    <input
                      type="file"
                      id="imagen"
                      name="imagen"
                      onChange={handleChange}
                      accept="image/*"
                    />
                    <small>Formatos aceptados: JPG, PNG, GIF. Máx 5MB.</small>
                  </div>
                  
                  <div className="misproductos-form-actions">
                    <button
                      type="submit"
                      className="misproductos-submit"
                      disabled={submitting}
                    >
                      {submitting ? 'Guardando...' : (editProductId ? 'Actualizar Producto' : 'Guardar Producto')}
                    </button>
                    <button
                      type="button"
                      className="misproductos-cancel"
                      onClick={handleCancel}
                      disabled={submitting}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="misproductos-list">
            <div className="misproductos-count">
              <p>Mis productos: {productos.length}</p>
            </div>
            
            {loading ? (
              <div className="misproductos-loading">
                <p>Cargando productos...</p>
              </div>
            ) : (
              <div className="misproductos-grid">
                {productos.length === 0 ? (
                  <div className="misproductos-no-results">
                    <p>No has agregado productos aún.</p>
                  </div>
                ) : (
                  productos.map((prod) => (
                    <div className="misproductos-card" key={prod.id_producto}>
                      <div className="misproductos-image">
                        <img
                          src={
                            prod.imagen_optimizada 
                              ? `http://localhost:8080/uploads/productos/${prod.imagen_optimizada}` 
                              : (prod.imagen_principal || "https://via.placeholder.com/300x200?text=Imagen")
                          }
                          alt={prod.nombre}
                        />
                        <div className={`misproductos-badge misproductos-badge--${prod.estado}`}>
                          {prod.estado === 'nuevo' ? 'Nuevo' : 
                           prod.estado === 'usado' ? 'Usado' : 
                           prod.estado === 'donacion' ? 'Donación' : prod.estado}
                        </div>
                      </div>
                      <div className="misproductos-info">
                        <h3 className="misproductos-title">{prod.nombre}</h3>
                        <p className="misproductos-description">{prod.descripcion}</p>
                        <div className="misproductos-meta">
                          <span className="misproductos-price">${prod.precio}</span>
                          <span style={{ fontSize: 13, color: "#888" }}>
                            {prod.existencia} disponibles
                          </span>
                        </div>
                        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                          <button
                            className="misproductos-filter-reset"
                            style={{ background: "var(--accent-color)", color: "#222", padding: "0.3rem 1rem", fontSize: 14 }}
                            onClick={() => handleEdit(prod)}
                            disabled={submitting}
                          >
                            Editar
                          </button>
                          <button
                            className="misproductos-filter-reset"
                            style={{ background: "#ff7675", color: "#fff", padding: "0.3rem 1rem", fontSize: 14 }}
                            onClick={() => handleDelete(prod.id_producto)}
                            disabled={submitting}
                          >
                            Borrar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default MisProductos;
