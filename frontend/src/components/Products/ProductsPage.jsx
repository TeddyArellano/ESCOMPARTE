import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import "./ProductsPage.css";
import placeholderImage from "../../assets/images/placeholder-component.svg";
import { productService } from "../../services/apiService";
import { CartContext } from "../../contexts/CartContext";

const ProductsPage = () => {
  // Estado para los productos
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Estado para el carrito
  const [addingToCart, setAddingToCart] = useState(null); // Guarda el ID del producto que se está agregando
  const [cartMessage, setCartMessage] = useState(null);
  const { addToCart } = useContext(CartContext);

  // Estado para los filtros
  const [filters, setFilters] = useState({
    category: "todos",
    priceRange: "todos",
    condition: "todos",
    availability: "todos"
  });

  // Obtener productos desde la API cuando el componente se monte
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getAllProducts();
        
        // Verificar que la respuesta tenga el formato esperado
        if (!response || !response.success || !response.data) {
          throw new Error("Formato de respuesta inválido");
        }
        
        const fetchedProducts = response.data;          // Transformar los productos para adaptarse a la estructura actual
        const transformedProducts = fetchedProducts.map(product => ({
          id: product.id_producto,
          name: product.nombre,
          description: product.descripcion,
          category: mapCategoryFromProduct(product),
          price: product.precio,
          condition: product.estado,
          availability: mapAvailabilityFromProduct(product),
          // Usar la mejor imagen disponible o la imagen por defecto
          image: product.imagen_optimizada 
            ? `http://localhost:8080/uploads/productos/${product.imagen_optimizada}` 
            : (product.imagen_principal || placeholderImage)
        }));

        setProducts(transformedProducts);
        setError(null);
      } catch (err) {
        console.error("Error al obtener productos:", err);
        setError("No se pudieron cargar los productos. Por favor, intente más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Función para mapear categorías desde los datos de la API
  const mapCategoryFromProduct = (product) => {
    // Aquí podríamos tener lógica para mapear categorías si la API las maneja de forma diferente
    // Por ahora, asumimos que no hay categorías y retornamos un valor por defecto
    return "componentes_electronicos"; // Valor por defecto
  };

  // Función para mapear disponibilidad desde los datos de la API
  const mapAvailabilityFromProduct = (product) => {
    if (!product.existencia || product.existencia <= 0) {
      return "agotado";
    } else if (product.existencia < 5) {
      return "pocas_unidades";
    } else {
      return "disponible";
    }
  };

  // Función para manejar cambios en los filtros
  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
  };

  // Función para filtrar productos según los filtros seleccionados
  const filteredProducts = products.filter(product => {
    // Filtro por categoría
    if (filters.category !== "todos" && product.category !== filters.category) {
      return false;
    }
    
    // Filtro por rango de precio
    if (filters.priceRange !== "todos") {
      const [min, max] = filters.priceRange === "500+" 
        ? [500, Infinity] 
        : filters.priceRange.split("-").map(Number);
      
      if (product.price < min || product.price > max) {
        return false;
      }
    }
    
    // Filtro por estado (nuevo/usado)
    if (filters.condition !== "todos" && product.condition !== filters.condition) {
      return false;
    }
    
    // Filtro por disponibilidad
    if (filters.availability !== "todos" && product.availability !== filters.availability) {
      return false;
    }
    
    return true;
  });
  
  // Función para agregar un producto al carrito
  const handleAddToCart = async (productId) => {
    try {
      setAddingToCart(productId);
      const result = await addToCart(productId, 1); // Agregar 1 unidad por defecto
      
      if (result.success) {
        setCartMessage({ 
          type: 'success', 
          text: 'Producto agregado al carrito exitosamente',
          productId 
        });
      } else {
        setCartMessage({ 
          type: 'error', 
          text: result.message || 'Error al agregar al carrito',
          productId 
        });
      }
    } catch (err) {
      console.error('Error al agregar al carrito:', err);
      setCartMessage({ 
        type: 'error', 
        text: 'Error al agregar producto al carrito',
        productId 
      });
    } finally {
      // Resetear el estado después de un tiempo
      setTimeout(() => {
        setAddingToCart(null);
        setCartMessage(null);
      }, 3000);
    }
  };

  return (
    <div className="escomparte">
      <Header />
      <div className="escomparte__container">
        <main className="products-page">
          <section className="products-hero">
            <h1>Catálogo de Componentes</h1>
            <p>Explora nuestra selección de componentes electrónicos, herramientas y material didáctico</p>
            <Link to="/mis-productos" className="escomparte__button" style={{ marginTop: "1rem" }}>
              Ir a Mis Productos
            </Link>
          </section>
          
          <div className="products-content">
            <aside className="products-filters">
              {/* Categorías filtro comentado temporalmente porque no está funcionando correctamente
              <div className="filter-section">
                <h3>Categorías</h3>
                <div className="filter-options">
                  <label>
                    <input 
                      type="radio" 
                      name="category" 
                      value="todos" 
                      checked={filters.category === "todos"}
                      onChange={() => handleFilterChange("category", "todos")}
                    />
                    Todos
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="category" 
                      value="microcontroladores" 
                      checked={filters.category === "microcontroladores"}
                      onChange={() => handleFilterChange("category", "microcontroladores")}
                    />
                    Microcontroladores
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="category" 
                      value="componentes_pasivos" 
                      checked={filters.category === "componentes_pasivos"}
                      onChange={() => handleFilterChange("category", "componentes_pasivos")}
                    />
                    Componentes Pasivos
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="category" 
                      value="sensores" 
                      checked={filters.category === "sensores"}
                      onChange={() => handleFilterChange("category", "sensores")}
                    />
                    Sensores
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="category" 
                      value="actuadores" 
                      checked={filters.category === "actuadores"}
                      onChange={() => handleFilterChange("category", "actuadores")}
                    />
                    Actuadores
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="category" 
                      value="displays" 
                      checked={filters.category === "displays"}
                      onChange={() => handleFilterChange("category", "displays")}
                    />
                    Displays y Visualización
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="category" 
                      value="herramientas" 
                      checked={filters.category === "herramientas"}
                      onChange={() => handleFilterChange("category", "herramientas")}
                    />
                    Herramientas
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="category" 
                      value="material_didactico" 
                      checked={filters.category === "material_didactico"}
                      onChange={() => handleFilterChange("category", "material_didactico")}
                    />
                    Material Didáctico
                  </label>
                </div>
              </div>
              */}
              
              <div className="filter-section">
                <h3>Precio</h3>
                <div className="filter-options">
                  <label>
                    <input 
                      type="radio" 
                      name="priceRange" 
                      value="todos" 
                      checked={filters.priceRange === "todos"}
                      onChange={() => handleFilterChange("priceRange", "todos")}
                    />
                    Todos
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="priceRange" 
                      value="0-100" 
                      checked={filters.priceRange === "0-100"}
                      onChange={() => handleFilterChange("priceRange", "0-100")}
                    />
                    $0 - $100
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="priceRange" 
                      value="100-200" 
                      checked={filters.priceRange === "100-200"}
                      onChange={() => handleFilterChange("priceRange", "100-200")}
                    />
                    $100 - $200
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="priceRange" 
                      value="200-500" 
                      checked={filters.priceRange === "200-500"}
                      onChange={() => handleFilterChange("priceRange", "200-500")}
                    />
                    $200 - $500
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="priceRange" 
                      value="500+" 
                      checked={filters.priceRange === "500+"}
                      onChange={() => handleFilterChange("priceRange", "500+")}
                    />
                    $500+
                  </label>
                </div>
              </div>
              
              <div className="filter-section">
                <h3>Estado</h3>
                <div className="filter-options">
                  <label>
                    <input 
                      type="radio" 
                      name="condition" 
                      value="todos" 
                      checked={filters.condition === "todos"}
                      onChange={() => handleFilterChange("condition", "todos")}
                    />
                    Todos
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="condition" 
                      value="nuevo" 
                      checked={filters.condition === "nuevo"}
                      onChange={() => handleFilterChange("condition", "nuevo")}
                    />
                    Nuevo
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="condition" 
                      value="usado" 
                      checked={filters.condition === "usado"}
                      onChange={() => handleFilterChange("condition", "usado")}
                    />
                    Usado
                  </label>
                </div>
              </div>
              
              <div className="filter-section">
                <h3>Disponibilidad</h3>
                <div className="filter-options">
                  <label>
                    <input 
                      type="radio" 
                      name="availability" 
                      value="todos" 
                      checked={filters.availability === "todos"}
                      onChange={() => handleFilterChange("availability", "todos")}
                    />
                    Todos
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="availability" 
                      value="disponible" 
                      checked={filters.availability === "disponible"}
                      onChange={() => handleFilterChange("availability", "disponible")}
                    />
                    Disponible
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="availability" 
                      value="pocas_unidades" 
                      checked={filters.availability === "pocas_unidades"}
                      onChange={() => handleFilterChange("availability", "pocas_unidades")}
                    />
                    Pocas Unidades
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="availability" 
                      value="bajo_pedido" 
                      checked={filters.availability === "bajo_pedido"}
                      onChange={() => handleFilterChange("availability", "bajo_pedido")}
                    />
                    Bajo Pedido
                  </label>
                </div>
              </div>
              
              <button className="filter-reset" onClick={() => setFilters({
                category: "todos",
                priceRange: "todos",
                condition: "todos",
                availability: "todos"
              })}>
                Resetear Filtros
              </button>
            </aside>
            
            <div className="products-list">
              {loading ? (
                <div className="products-loading">
                  <p>Cargando productos...</p>
                </div>
              ) : error ? (
                <div className="products-error">
                  <p>{error}</p>
                  <button onClick={() => window.location.reload()}>Reintentar</button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="products-empty">
                  <p>No se encontraron productos con los filtros seleccionados</p>
                  <button className="filter-reset" onClick={() => setFilters({
                    category: "todos",
                    priceRange: "todos",
                    condition: "todos",
                    availability: "todos"
                  })}>
                    Resetear Filtros
                  </button>
                </div>
              ) : (
                <div className="products-count">
                  <p>Mostrando {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}</p>
                </div>
              )}
              
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <div className="product-card" key={product.id}>
                    <div className="product-image">
                      <img src={product.image} alt={product.name} />
                      {product.availability === "pocas_unidades" && (
                        <div className="product-badge product-badge--low-stock">
                          ¡Pocas unidades!
                        </div>
                      )}
                      {product.condition === "usado" && (
                        <div className="product-badge product-badge--used">
                          Usado
                        </div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3 className="product-title">{product.name}</h3>
                      <p className="product-description">{product.description}</p>                      
                      <div className="product-meta">
                        <span className="product-price">${product.price} MXN</span>
                        <div className="product-actions">
                          <Link to={`/productos/${product.id}`} className="product-action">Detalles</Link>
                          <button 
                            className={`product-action product-action--cart ${addingToCart === product.id ? 'loading' : ''}`} 
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToCart(product.id);
                            }}
                            disabled={addingToCart !== null || product.availability === "agotado"}
                            title={product.availability === "agotado" ? "Producto agotado" : "Añadir al carrito"}
                          >
                            {addingToCart === product.id ? (
                              <span className="spinner"></span>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      {cartMessage && cartMessage.productId === product.id && (
                        <div className={`cart-message cart-message--${cartMessage.type}`}>
                          {cartMessage.text}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default ProductsPage;
